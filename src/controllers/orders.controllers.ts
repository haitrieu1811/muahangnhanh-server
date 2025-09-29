import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ORDER_MESSAGES } from '~/constants/message'
import {
  CancelOrderReqBody,
  CreateOrderReqBody,
  GetOrdersReqQuery,
  OrderIdReqParams,
  UpdateOrderReqBody
} from '~/models/requests/orders.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import ordersService from '~/services/orders.services'

export const createOrderController = async (req: Request<ParamsDictionary, any, CreateOrderReqBody>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await ordersService.createOrder({
    userId: new ObjectId(userId),
    body: req.body
  })
  res.json({
    message: ORDER_MESSAGES.CREATE_ORDER_SUCCESS,
    data: result
  })
}

export const getMyOrdersController = async (
  req: Request<ParamsDictionary, any, any, GetOrdersReqQuery>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const configuredQuery = omitBy(
    {
      userId: new ObjectId(userId),
      status: req.query.status !== undefined ? Number(req.query.status) : undefined
    },
    isUndefined
  )
  const { orders, ...pagination } = await ordersService.getOrders({
    match: configuredQuery,
    query: req.query
  })
  res.json({
    message: ORDER_MESSAGES.GET_MY_ORDERS_SUCCESS,
    data: {
      orders,
      pagination
    }
  })
}

export const getOrderController = async (req: Request<OrderIdReqParams>, res: Response) => {
  const result = await ordersService.getOrder(new ObjectId(req.params.orderId))
  res.json({
    message: ORDER_MESSAGES.GET_ORDER_SUCCESS,
    data: result
  })
}

export const updateOrderController = async (req: Request<OrderIdReqParams, any, UpdateOrderReqBody>, res: Response) => {
  await ordersService.updateOrder({
    orderId: new ObjectId(req.params.orderId),
    body: req.body
  })
  res.json({
    message: ORDER_MESSAGES.UPDATE_ORDER_SUCCESS
  })
}

export const getAllOrdersController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { orders, ...pagination } = await ordersService.getOrders({
    query: req.query
  })
  res.json({
    message: ORDER_MESSAGES.GET_ALL_ORDERS_SUCCESS,
    data: {
      orders,
      pagination
    }
  })
}

export const cancelOrderController = async (req: Request<OrderIdReqParams, any, CancelOrderReqBody>, res: Response) => {
  await ordersService.updateOrder({
    orderId: new ObjectId(req.params.orderId),
    body: req.body
  })
  res.json({
    message: ORDER_MESSAGES.CANCEL_ORDER_SUCCESS
  })
}
