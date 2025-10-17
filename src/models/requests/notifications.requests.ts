import { ParamsDictionary } from 'express-serve-static-core'

import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type GetNotificationsReqQuery = PaginationReqQuery & {
  isRead?: string
}

export type NotificationIdReqParams = ParamsDictionary & {
  notificationId: string
}
