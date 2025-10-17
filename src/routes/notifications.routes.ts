import { Router } from 'express'

import {
  getMyNotificationsController,
  markAsReadAllNotificationsController,
  markAsReadNotificationController
} from '~/controllers/notifications.controllers'
import { notificationAuthorValidator, notificationIdValidator } from '~/middlewares/notifications.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const notificationsRouter = Router()

notificationsRouter.get('/me', accessTokenValidator, paginationValidator, getMyNotificationsController)

notificationsRouter.put(
  '/:notificationId/mark-as-read',
  accessTokenValidator,
  notificationIdValidator,
  notificationAuthorValidator,
  markAsReadNotificationController
)

notificationsRouter.put('/mark-as-read/all', accessTokenValidator, markAsReadAllNotificationsController)

export default notificationsRouter
