import { Router } from 'express'

import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductController,
  getProductsByCustomerController,
  updateProductController
} from '~/controllers/products.controllers'
import {
  createProductValidator,
  getProductsValidator,
  productAuthorValidator,
  productIdValidator
} from '~/middlewares/products.middlewares'
import { accessTokenValidator, isAdminValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const productsRouter = Router()

productsRouter.post('/', accessTokenValidator, createProductValidator, createProductController)

productsRouter.put(
  '/:productId',
  accessTokenValidator,
  isAdminValidator,
  isVerifiedUserValidator,
  productIdValidator,
  productAuthorValidator,
  createProductValidator,
  updateProductController
)

productsRouter.get('/', paginationValidator, getProductsValidator, getProductsByCustomerController)

productsRouter.get(
  '/all',
  accessTokenValidator,
  isAdminValidator,
  isVerifiedUserValidator,
  paginationValidator,
  getProductsValidator,
  getAllProductsController
)

productsRouter.get('/:productId', productIdValidator, getProductController)

productsRouter.delete(
  '/:productId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  productIdValidator,
  deleteProductController
)

export default productsRouter
