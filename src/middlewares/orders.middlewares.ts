import { Request } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { CART_MESSAGES, ORDER_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createOrderValidator = validate(
  checkSchema(
    {
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
