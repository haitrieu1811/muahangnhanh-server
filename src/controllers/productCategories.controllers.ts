import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { CreateProductCategoryReqBody } from '~/models/requests/productCategories.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import productCategoriesService from '~/services/productCategories.services'

// Tạo danh mục sản phẩm
export const createProductCategoryController = async (
  req: Request<ParamsDictionary, any, CreateProductCategoryReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await productCategoriesService.create(req.body, new ObjectId(userId))
  res.json({
    message: PRODUCTS_MESSAGES.CREATE_PRODUCT_CATEGORY_SUCCESS,
    data: result
  })
}
