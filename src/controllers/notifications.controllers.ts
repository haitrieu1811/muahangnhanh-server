import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { TokenPayload } from '~/models/requests/users.requests'
import notificationsService, { GetNotificationsReqQuery } from '~/services/notifications.services'

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
