import { Router } from 'express'

import {
  addProductToCartController,
  deleteCartItemsController,
  getMyCartController,
  updateCartItemController
} from '~/controllers/cartItems.controllers'
import {
  addProductToCartValidator,
  cartItemIdValidator,
  cartItemsAuthorValidator,
  deleteCartItemsValidator
} from '~/middlewares/cartItems.middlewares'
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

cartItemsRouter.put(
  '/:cartItemId',
  accessTokenValidator,
  isVerifiedUserValidator,
  cartItemIdValidator,
  updateCartItemController
)

cartItemsRouter.delete(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  deleteCartItemsValidator,
  cartItemsAuthorValidator,
  deleteCartItemsController
)

export default cartItemsRouter
