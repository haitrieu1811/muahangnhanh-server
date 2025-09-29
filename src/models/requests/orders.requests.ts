import { ParamsDictionary, Query } from 'express-serve-static-core'

import { OrderStatus, ShippingMethod } from '~/constants/enum'
import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreateOrderReqBody = {
  items: string[]
  totalItems: number
  totalAmount: number
  note?: string
  addressId: string
  shippingMethod: ShippingMethod
  shippingFee: number
  totalDiscount?: number
}

export type OrderIdReqParams = ParamsDictionary & {
  orderId: string
}

export type UpdateOrderReqBody = {
  status: OrderStatus
}

export type GetOrdersReqQuery = Query &
  PaginationReqQuery & {
    status?: OrderStatus
  }

export type CancelOrderReqBody = {
  status: OrderStatus
}
