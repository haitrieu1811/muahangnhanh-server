import { ParamsDictionary } from 'express-serve-static-core'

import { OrderStatus, ShippingMethod } from '~/constants/enum'

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
