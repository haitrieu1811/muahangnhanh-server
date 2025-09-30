import { ParamsDictionary, Query } from 'express-serve-static-core'
import { ProductConstructor } from '~/models/databases/Product'

import { PaginationReqQuery } from '~/models/requests/utils.requests'

export type CreateProductReqBody = Omit<ProductConstructor, '_id' | 'userId' | 'createdAt' | 'updatedAt'> & {
  thumbnail: string
  photos: string[]
  categoryId: string
}

export type ProductIdReqParams = ParamsDictionary & {
  productId: string
}

export type GetProductsReqQuery = Query &
  PaginationReqQuery & {
    name?: string
    sortBy?: string
    orderBy?: 'asc' | 'desc'
    categoryIds?: string
    minStarPoints?: string
    isFlashSale?: boolean
    isActive?: boolean
    status?: string
  }
