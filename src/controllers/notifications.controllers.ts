import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { GetNotificationsReqQuery, NotificationIdReqParams } from '~/models/requests/notifications.requests'

import { TokenPayload } from '~/models/requests/users.requests'
import notificationsService from '~/services/notifications.services'

export const getMyNotificationsController = async (
  req: Request<ParamsDictionary, any, any, GetNotificationsReqQuery>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const { totalUnRead, notifications, ...pagination } = await notificationsService.findMany({
    match: {
      userId: new ObjectId(userId)
    },
    query: req.query
  })
  res.json({
    message: 'Lấy danh sách thông báo của tôi thành công.',
    data: {
      totalUnRead,
      notifications,
      pagination
    }
  })
}

export const markAsReadNotificationController = async (req: Request<NotificationIdReqParams>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const data = await notificationsService.markAsRead({
    userId: new ObjectId(userId),
    notificationId: new ObjectId(req.params.notificationId)
  })
  res.json({
    message: 'Đánh dấu đã đọc thông báo thành công.',
    data
  })
}

export const markAsReadAllNotificationsController = async (req: Request<NotificationIdReqParams>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const data = await notificationsService.markAsRead({
    userId: new ObjectId(userId)
  })
  res.json({
    message: 'Đánh dấu đã đọc tất cả thông báo thành công.',
    data
  })
}
