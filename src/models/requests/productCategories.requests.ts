import { ParamsDictionary } from 'express-serve-static-core'

export type CreateProductCategoryReqBody = {
  name: string
  thumbnail: string
  description?: string
}

export type ProductCategoryIdReqParams = ParamsDictionary & {
  productCategoryId: string
}
