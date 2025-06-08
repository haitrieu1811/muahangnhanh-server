import { Router } from 'express'

import { addProductToCartController, getMyCartController } from '~/controllers/cartItems.controllers'
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

cartItemsRouter.get('/me', accessTokenValidator, isVerifiedUserValidator, getMyCartController)

export default cartItemsRouter
