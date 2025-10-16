import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

export type GetNotificationsReqQuery = PaginationReqQuery & {
  isRead?: string
}

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
}

const notificationsService = new NotificationsService()

export default notificationsService
