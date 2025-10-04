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
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const cartItemsRouter = Router()

cartItemsRouter.post(
  '/add/product/:productId',
  accessTokenValidator,
  productIdValidator,
  addProductToCartValidator,
  addProductToCartController
)

cartItemsRouter.get('/me', accessTokenValidator, getMyCartController)

cartItemsRouter.put(
  '/:cartItemId',
  accessTokenValidator,
  cartItemIdValidator,
  addProductToCartValidator,
  updateCartItemController
)

cartItemsRouter.delete(
  '/',
  accessTokenValidator,
  deleteCartItemsValidator,
  cartItemsAuthorValidator,
  deleteCartItemsController
)

export default cartItemsRouter
