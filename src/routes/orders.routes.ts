import { Router } from 'express'

import { createOrderController } from '~/controllers/orders.controllers'
import { createOrderValidator } from '~/middlewares/orders.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const ordersRouter = Router()

ordersRouter.post('/', accessTokenValidator, isVerifiedUserValidator, createOrderValidator, createOrderController)

export default ordersRouter
