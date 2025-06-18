import { ParamsDictionary } from 'express-serve-static-core'

import { OrderStatus } from '~/constants/enum'

export type CreateOrderReqBody = {
  items: string[]
  totalItems: number
  totalAmount: number
  note?: string
  addressId: string
}

export type OrderIdReqParams = ParamsDictionary & {
  orderId: string
}

export type UpdateOrderReqBody = {
  status: OrderStatus
}
