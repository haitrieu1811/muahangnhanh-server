import { ParamsDictionary } from 'express-serve-static-core'

export type CreateProductReqBody = {
  thumbnail: string
  photos?: string[]
  name: string
  description: string
  price: number
  priceAfterDiscount?: number
  categoryId: string
}

export type ProductIdReqParams = ParamsDictionary & {
  productId: string
}
