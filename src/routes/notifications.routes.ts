import { Router } from 'express'

import { getMyNotificationsController } from '~/controllers/notifications.controllers'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const notificationsRouter = Router()

notificationsRouter.get('/me', accessTokenValidator, paginationValidator, getMyNotificationsController)

export default notificationsRouter
