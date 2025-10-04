import { Router } from 'express'

import {
  createProductCategoryController,
  deleteProductCategoryController,
  getProductCategoriesController,
  getProductCategoryController,
  updateProductCategoryController
} from '~/controllers/productCategories.controllers'
import {
  createProductCategoryValidator,
  isEmptyProductCategoryValidator,
  productCategoryIdValidator
} from '~/middlewares/productCategories.middlewares'

import { accessTokenValidator, isActiveUserValidator, isAdminValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const productCategoriesRouter = Router()

productCategoriesRouter.post(
  '/',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  createProductCategoryValidator,
  createProductCategoryController
)

productCategoriesRouter.put(
  '/:productCategoryId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  productCategoryIdValidator,
  createProductCategoryValidator,
  updateProductCategoryController
)

productCategoriesRouter.delete(
  '/:productCategoryId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  productCategoryIdValidator,
  isEmptyProductCategoryValidator,
  deleteProductCategoryController
)

productCategoriesRouter.get('/', paginationValidator, getProductCategoriesController)

productCategoriesRouter.get('/:productCategoryId', productCategoryIdValidator, getProductCategoryController)

export default productCategoriesRouter
