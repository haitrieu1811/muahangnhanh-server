import { Router } from 'express'

import {
  createProductController,
  getProductController,
  getProductsController,
  updateProductController
} from '~/controllers/products.controllers'
import {
  createProductValidator,
  getProductsValidator,
  productAuthorValidator,
  productIdValidator
} from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const productsRouter = Router()

productsRouter.post('/', accessTokenValidator, createProductValidator, createProductController)

productsRouter.put(
  '/:productId',
  accessTokenValidator,
  productIdValidator,
  productAuthorValidator,
  createProductValidator,
  updateProductController
)

productsRouter.get('/', paginationValidator, getProductsValidator, getProductsController)

productsRouter.get('/:productId', productIdValidator, getProductController)

export default productsRouter
