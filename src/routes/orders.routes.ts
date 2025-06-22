import { Router } from 'express'

import {
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  getOrderController,
  updateOrderController
} from '~/controllers/orders.controllers'
import {
  createOrderValidator,
  orderAuthorOrAdminValidator,
  orderAuthorValidator,
  orderIdValidator,
  updateOrderValidator
} from '~/middlewares/orders.middlewares'
import { accessTokenValidator, isAdminValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const ordersRouter = Router()

ordersRouter.post('/', accessTokenValidator, isVerifiedUserValidator, createOrderValidator, createOrderController)

ordersRouter.get('/me', accessTokenValidator, isVerifiedUserValidator, paginationValidator, getMyOrdersController)

ordersRouter.get(
  '/all',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  paginationValidator,
  getAllOrdersController
)

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
  orderAuthorOrAdminValidator,
  updateOrderValidator,
  updateOrderController
)

export default ordersRouter
