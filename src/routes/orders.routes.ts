import { Router } from 'express'

import { createOrderController, getMyOrdersController } from '~/controllers/orders.controllers'
import { createOrderValidator } from '~/middlewares/orders.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const ordersRouter = Router()

ordersRouter.post('/', accessTokenValidator, isVerifiedUserValidator, createOrderValidator, createOrderController)

ordersRouter.get('/me', accessTokenValidator, isVerifiedUserValidator, paginationValidator, getMyOrdersController)

export default ordersRouter
