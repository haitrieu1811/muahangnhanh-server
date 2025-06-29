import { ParamsDictionary } from 'express-serve-static-core'

import { PaginationReqQuery } from '~/models/requests/utils.requests'

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

export type GetProductsReqQuery = PaginationReqQuery & {
  name?: string
  sortBy?: string
  orderBy?: 'asc' | 'desc'
  categoryIds?: string
  minStarPoints?: 1 | 2 | 3 | 4 | 5
}
