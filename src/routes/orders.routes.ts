import { Router } from 'express'

import {
  cancelOrderController,
  createOrderController,
  createOrderEventController,
  getAllOrdersController,
  getMyOrdersController,
  getOrderController,
  getOrderEventsController,
  updateOrderController
} from '~/controllers/orders.controllers'
import {
  createOrderEventValidator,
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

ordersRouter.post(
  '/:orderId/cancel',
  accessTokenValidator,
  isVerifiedUserValidator,
  orderIdValidator,
  orderAuthorValidator,
  cancelOrderController
)

ordersRouter.post(
  '/:orderId/events',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  orderIdValidator,
  createOrderEventValidator,
  createOrderEventController
)

ordersRouter.get(
  '/:orderId/events',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  orderIdValidator,
  getOrderEventsController
)

export default ordersRouter
