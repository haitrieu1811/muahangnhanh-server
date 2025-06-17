import { ParamsDictionary } from 'express-serve-static-core'

export type CreateOrderReqBody = {
  items: string[]
  totalItems: number
  totalAmount: number
  note?: string
}

export type OrderIdReqParams = ParamsDictionary & {
  orderId: string
}
