import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { ORDER_MESSAGES } from '~/constants/message'
import { CreateOrderReqBody } from '~/models/requests/orders.requests'
import { TokenPayload } from '~/models/requests/users.requests'
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
