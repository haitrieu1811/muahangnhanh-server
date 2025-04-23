import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { CreateProductCategoryReqBody, ProductCategoryIdReqParams } from '~/models/requests/productCategories.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
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

// Cập nhật danh mục sản phẩm
export const updateProductCategoryController = async (
  req: Request<ProductCategoryIdReqParams, any, CreateProductCategoryReqBody>,
  res: Response
) => {
  const { productCategoryId } = req.params
  const result = await productCategoriesService.update(req.body, new ObjectId(productCategoryId))
  res.json({
    message: PRODUCTS_MESSAGES.UPDATE_PRODUCT_CATEGORY_SUCCESS,
    data: result
  })
}

// Xóa danh mục sản phẩm
export const deleteProductCategoryController = async (req: Request<ProductCategoryIdReqParams>, res: Response) => {
  const { productCategoryId } = req.params
  await productCategoriesService.delete(new ObjectId(productCategoryId))
  res.json({
    message: PRODUCTS_MESSAGES.DELETE_PRODUCT_CATEGORY_SUCCESS
  })
}

// Lấy danh sách danh mục sản phẩm
export const getProductCategoriesController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const result = await productCategoriesService.read(req.query)
  res.json({
    message: PRODUCTS_MESSAGES.GET_PRODUCT_CATEGORIES_SUCCESS,
    data: result
  })
}

// Lấy thông tin chi tiết một danh mục sản phẩm
export const getProductCategoryController = async (req: Request<ProductCategoryIdReqParams>, res: Response) => {
  const result = await productCategoriesService.readDetail(new ObjectId(req.params.productCategoryId))
  res.json({
    message: PRODUCTS_MESSAGES.GET_PRODUCT_CATEGORY_SUCCESS,
    data: result
  })
}
