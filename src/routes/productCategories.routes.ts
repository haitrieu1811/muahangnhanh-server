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

import {
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  isVerifiedUserValidator
} from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const productCategoriesRouter = Router()

productCategoriesRouter.post(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  createProductCategoryValidator,
  createProductCategoryController
)

productCategoriesRouter.put(
  '/:productCategoryId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  productCategoryIdValidator,
  createProductCategoryValidator,
  updateProductCategoryController
)

productCategoriesRouter.delete(
  '/:productCategoryId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  productCategoryIdValidator,
  isEmptyProductCategoryValidator,
  deleteProductCategoryController
)

productCategoriesRouter.get('/', paginationValidator, getProductCategoriesController)

productCategoriesRouter.get('/:productCategoryId', productCategoryIdValidator, getProductCategoryController)

export default productCategoriesRouter
