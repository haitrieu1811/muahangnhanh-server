import { Router } from 'express'

import {
  cancelOrderController,
  createOrderController,
  createOrderEventController,
  deleteOrderEventController,
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
  orderEventIdValidator,
  orderIdValidator,
  updateOrderValidator
} from '~/middlewares/orders.middlewares'
import { accessTokenValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const ordersRouter = Router()

ordersRouter.post('/', accessTokenValidator, createOrderValidator, createOrderController)

ordersRouter.get('/me', accessTokenValidator, paginationValidator, getMyOrdersController)

ordersRouter.get('/all', accessTokenValidator, isAdminValidator, paginationValidator, getAllOrdersController)

ordersRouter.get('/:orderId', accessTokenValidator, orderIdValidator, orderAuthorValidator, getOrderController)

ordersRouter.put(
  '/:orderId',
  accessTokenValidator,
  orderIdValidator,
  orderAuthorOrAdminValidator,
  updateOrderValidator,
  updateOrderController
)

ordersRouter.post(
  '/:orderId/cancel',
  accessTokenValidator,
  orderIdValidator,
  orderAuthorValidator,
  cancelOrderController
)

ordersRouter.post(
  '/:orderId/events',
  accessTokenValidator,
  orderIdValidator,
  createOrderEventValidator,
  createOrderEventController
)

ordersRouter.get('/:orderId/events', accessTokenValidator, isAdminValidator, orderIdValidator, getOrderEventsController)

ordersRouter.delete(
  '/events/:orderEventId',
  accessTokenValidator,
  isAdminValidator,
  orderEventIdValidator,
  deleteOrderEventController
)

export default ordersRouter
