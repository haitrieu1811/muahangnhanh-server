import { ObjectId } from 'mongodb'
import { GetNotificationsReqQuery } from '~/models/requests/notifications.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class NotificationsService {
  async findMany({ match = {}, query }: { match?: object; query: GetNotificationsReqQuery }) {
    const { page, limit, skip } = configurePagination(query)
    const [notifications, totalNotifications, totalUnRead] = await Promise.all([
      databaseService.notifications
        .find(match)
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1
        })
        .toArray(),
      databaseService.notifications.countDocuments(match),
      databaseService.notifications.countDocuments({
        ...match,
        isRead: false
      })
    ])
    return {
      totalUnRead,
      notifications,
      page,
      limit,
      totalRows: totalNotifications,
      totalPages: Math.ceil(totalNotifications / limit)
    }
  }

  async markAsRead({ userId, notificationId }: { userId: ObjectId; notificationId?: ObjectId }) {
    /**
     * Nếu có truyền `notificationId` thì đánh dấu một thông báo đã đọc
     * Nếu không truyền thì đánh dấu tất cả thông báo đã đọc
     */
    const match = !notificationId
      ? {
          userId
        }
      : {
          _id: notificationId
        }

    const { modifiedCount } = await databaseService.notifications.updateMany(match, {
      $set: {
        isRead: true
      }
    })

    return {
      modifiedCount
    }
  }
}

const notificationsService = new NotificationsService()

export default notificationsService
