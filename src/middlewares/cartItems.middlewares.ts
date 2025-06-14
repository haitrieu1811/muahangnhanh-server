import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const cartItemIdsSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: CART_MESSAGES.CART_ITEM_IDS_IS_REQUIRED
        })
      }
      if (!Array.isArray(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: CART_MESSAGES.CART_ITEM_IDS_MUST_BE_AN_ARRAY
        })
      }
      const isAllValid = value.every((id) => ObjectId.isValid(id))
      if (!isAllValid) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: CART_MESSAGES.CART_ITEM_IDS_IS_INVALID
        })
      }
      const cartItems = await Promise.all(
        value.map(
          async (cartItemId) =>
            await databaseService.cartItems.findOne({
              _id: new ObjectId(cartItemId)
            })
        )
      )
      if (!cartItems.every((cartItem) => cartItem !== null)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: CART_MESSAGES.CART_ITEM_NOT_FOUND
        })
      }
      ;(req as Request).cartItems = cartItems
      return true
    }
  }
}

export const addProductToCartValidator = validate(
  checkSchema(
    {
      quantity: {
        custom: {
          options: (value) => {
            if (value === undefined) {
              throw new Error(CART_MESSAGES.QUANTITY_IS_REQUIRED)
            }
            if (!Number.isInteger(value)) {
              throw new Error(CART_MESSAGES.QUANTITY_MUST_BE_AN_INT)
            }
            if (value <= 0) {
              throw new Error(CART_MESSAGES.QUANTITY_MUST_BE_GREATER_THAN_ZERO)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const cartItemIdValidator = validate(
  checkSchema(
    {
      cartItemId: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CART_MESSAGES.CART_ITEM_ID_IS_REQUIRED
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CART_MESSAGES.CART_ITEM_ID_IS_INVALID
              })
            }
            const cartItem = await databaseService.cartItems.findOne({
              _id: new ObjectId(value)
            })
            if (!cartItem) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: CART_MESSAGES.CART_ITEM_NOT_FOUND
              })
            }
            ;(req as Request).cartItem = cartItem
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const cartItemAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  if (req.cartItem?.userId.toString() !== userId) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: UTILS_MESSAGES.PERMISSION_DENIED
      })
    )
  }
  next()
}

export const deleteCartItemsValidator = validate(
  checkSchema(
    {
      cartItemIds: cartItemIdsSchema
    },
    ['body']
  )
)

export const cartItemsAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  if (!req.cartItems?.every((cartItem) => cartItem.userId.toString() === userId)) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: UTILS_MESSAGES.PERMISSION_DENIED
      })
    )
  }
  next()
}
