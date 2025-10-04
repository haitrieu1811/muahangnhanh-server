import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { CART_MESSAGES } from '~/constants/message'
import Product from '~/models/databases/Product'
import {
  AddProductToCartReqBody,
  CartItemIdReqParams,
  DeleteCartItemsReqBody
} from '~/models/requests/cartItems.requests'
import { ProductIdReqParams } from '~/models/requests/products.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import cartItemsService from '~/services/cartItems.services'

export const addProductToCartController = async (
  req: Request<ProductIdReqParams, any, AddProductToCartReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const data = await cartItemsService.addProductToCart({
    product: req.product as Product,
    quantity: req.body.quantity,
    userId: new ObjectId(userId)
  })
  res.json({
    message: CART_MESSAGES.ADD_PRODUCT_TO_CART_SUCCESS,
    data
  })
}

export const getMyCartController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await cartItemsService.getMyCart(new ObjectId(userId))
  res.json({
    message: CART_MESSAGES.GET_MY_CART_SUCCESS,
    data: result
  })
}

export const updateCartItemController = async (
  req: Request<CartItemIdReqParams, any, AddProductToCartReqBody>,
  res: Response
) => {
  await cartItemsService.updateCartItem({
    cartItemId: new ObjectId(req.params.cartItemId),
    quantity: req.body.quantity
  })
  res.json({
    message: CART_MESSAGES.UPDATE_CART_ITEM_SUCCESS
  })
}

export const deleteCartItemsController = async (
  req: Request<ParamsDictionary, any, DeleteCartItemsReqBody>,
  res: Response
) => {
  const cartItemIds = req.body.cartItemIds.map((cartItemId) => new ObjectId(cartItemId))
  await cartItemsService.deleteCartItems(cartItemIds)
  res.json({
    message: CART_MESSAGES.DELETE_CART_ITEMS_SUCCESS
  })
}
