import { ParamsDictionary } from 'express-serve-static-core'

export type AddProductToCartReqBody = {
  quantity: number
}

export type CartItemIdReqParams = ParamsDictionary & {
  cartItemId: string
}

export type DeleteCartItemsReqBody = {
  cartItemIds: string[]
}
