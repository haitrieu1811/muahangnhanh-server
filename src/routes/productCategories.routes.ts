import { Router } from 'express'

import { createProductCategoryController } from '~/controllers/productCategories.controllers'
import { createProductCategoryValidator } from '~/middlewares/productCategories.middlewares'

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

export default productCategoriesRouter
