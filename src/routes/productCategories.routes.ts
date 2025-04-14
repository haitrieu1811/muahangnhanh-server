import { Router } from 'express'

import {
  createProductCategoryController,
  deleteProductCategoryController,
  updateProductCategoryController
} from '~/controllers/productCategories.controllers'
import { createProductCategoryValidator, productCategoryIdValidator } from '~/middlewares/productCategories.middlewares'

import {
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  isVerifiedUserValidator
} from '~/middlewares/users.middlewares'

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
  deleteProductCategoryController
)

export default productCategoriesRouter
