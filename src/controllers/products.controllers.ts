import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { CreateProductReqBody, ProductIdReqParams } from '~/models/requests/products.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import productsService from '~/services/products.services'

export const createProductController = async (
  req: Request<ParamsDictionary, any, CreateProductReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await productsService.createProduct({ body: req.body, userId: new ObjectId(userId) })
  res.json({
    message: PRODUCTS_MESSAGES.CREATE_PRODUCT_SUCCESS,
    data: result
  })
}

export const updateProductController = async (
  req: Request<ProductIdReqParams, any, CreateProductReqBody>,
  res: Response
) => {
  const result = await productsService.updateProduct({ body: req.body, productId: new ObjectId(req.params.productId) })
  res.json({
    message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_SUCCESS,
    data: result
  })
}

export const getProductsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { products, ...pagination } = await productsService.getProducts(req.query)
  res.json({
    message: PRODUCTS_MESSAGES.GET_PRODUCTS_SUCCESS,
    data: {
      products,
      pagination
    }
  })
}
