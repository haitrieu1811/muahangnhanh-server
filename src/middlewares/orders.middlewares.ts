import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES, ORDER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createOrderValidator = validate(
  checkSchema(
    {
      sellerId: {
        trim: true,
        custom: {
          options: async (sellerId: string, { req }) => {
            if (!sellerId) {
              throw new ErrorWithStatus({
                message: ORDER_MESSAGES.SELLER_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(sellerId)) {
              throw new ErrorWithStatus({
                message: ORDER_MESSAGES.SELLER_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const user = await databaseService.users.findOne({
              _id: new ObjectId(sellerId)
            })
            if (!user) {
              throw new ErrorWithStatus({
                message: ORDER_MESSAGES.SELLER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            const { userId: buyerId } = (req as Request).decodedAuthorization as TokenPayload
            if (sellerId === buyerId) {
              throw new ErrorWithStatus({
                message: ORDER_MESSAGES.CANNOT_BUY_YOUR_ITEMS,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      items: {
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
            if (value.length === 0) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: CART_MESSAGES.CART_ITEM_IDS_MUST_NOT_BE_EMPTY
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
      },
      totalItems: {
        custom: {
          options: (value) => {
            if (value === undefined) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.TOTAL_ITEMS_IS_REQUIRED
              })
            }
            if (!Number.isInteger(value) || value <= 0) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.TOTAL_ITEMS_MUST_BE_GREATER_THAN_ZERO
              })
            }
            return true
          }
        }
      },
      totalAmount: {
        custom: {
          options: (value) => {
            if (value === undefined) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.TOTAL_AMOUNT_IS_REQUIRED
              })
            }
            if (!Number.isInteger(value) || value <= 0) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.TOTAL_AMOUNT_MUST_BE_GREATER_THAN_ZERO
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)
