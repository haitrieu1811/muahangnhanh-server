import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { ORDER_MESSAGES } from '~/constants/message'
import { CreateOrderReqBody } from '~/models/requests/orders.requests'
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
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const { orders, ...pagination } = await ordersService.getOrders({
    userId: new ObjectId(userId),
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
