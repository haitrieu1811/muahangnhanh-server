import { Router } from 'express'

import { addProductToCartController } from '~/controllers/cartItems.controllers'
import { addProductToCartValidator } from '~/middlewares/cartItems.middlewares'
import { productIdValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const cartItemsRouter = Router()

cartItemsRouter.post(
  '/add/product/:productId',
  accessTokenValidator,
  isVerifiedUserValidator,
  productIdValidator,
  addProductToCartValidator,
  addProductToCartController
)

export default cartItemsRouter
