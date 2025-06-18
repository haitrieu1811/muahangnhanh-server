import { Router } from 'express'

import {
  createOrderController,
  getMyOrdersController,
  getOrderController,
  updateOrderController
} from '~/controllers/orders.controllers'
import {
  createOrderValidator,
  orderAuthorValidator,
  orderIdValidator,
  updateOrderValidator
} from '~/middlewares/orders.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const ordersRouter = Router()

ordersRouter.post('/', accessTokenValidator, isVerifiedUserValidator, createOrderValidator, createOrderController)

ordersRouter.get('/me', accessTokenValidator, isVerifiedUserValidator, paginationValidator, getMyOrdersController)

ordersRouter.get(
  '/:orderId',
  accessTokenValidator,
  isVerifiedUserValidator,
  orderIdValidator,
  orderAuthorValidator,
  getOrderController
)

ordersRouter.put(
  '/:orderId',
  accessTokenValidator,
  isVerifiedUserValidator,
  orderIdValidator,
  orderAuthorValidator,
  updateOrderValidator,
  updateOrderController
)

export default ordersRouter
