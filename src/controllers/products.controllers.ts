import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { CreateProductReqBody, GetProductsReqQuery, ProductIdReqParams } from '~/models/requests/products.requests'
import { TokenPayload } from '~/models/requests/users.requests'
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
  req: Request<ParamsDictionary, any, any, GetProductsReqQuery>,
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

export const getProductController = async (req: Request<ProductIdReqParams>, res: Response) => {
  const { product } = await productsService.getProduct(new ObjectId(req.params.productId))
  res.json({
    message: PRODUCTS_MESSAGES.GET_PRODUCT_SUCCESS,
    data: {
      product
    }
  })
}

export const getAllProductsController = async (
  req: Request<ParamsDictionary, any, any, GetProductsReqQuery>,
  res: Response
) => {
  const { products, ...pagination } = await productsService.getAllProducts(req.query)
  res.json({
    message: PRODUCTS_MESSAGES.GET_ALL_PRODUCTS_SUCCESS,
    data: {
      products,
      pagination
    }
  })
}
