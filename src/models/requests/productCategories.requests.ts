import { ParamsDictionary } from 'express-serve-static-core'

import { ProductCategoryStatus } from '~/constants/enum'

export type CreateProductCategoryReqBody = {
  name: string
  thumbnail: string
  description?: string
  status?: ProductCategoryStatus
}

export type ProductCategoryIdReqParams = ParamsDictionary & {
  productCategoryId: string
}
