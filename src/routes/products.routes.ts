import { Router } from 'express'

import {
  createProductController,
  getProductsController,
  updateProductController
} from '~/controllers/products.controllers'
import { createProductValidator, productAuthorValidator, productIdValidator } from '~/middlewares/products.middlewares'
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

productsRouter.get('/', paginationValidator, getProductsController)

export default productsRouter
