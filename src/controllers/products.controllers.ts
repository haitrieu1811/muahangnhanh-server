import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { CreateProductReqBody } from '~/models/requests/products.requests'
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
