import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { OrderStatus, UserRole } from '~/constants/enum'
import { CART_MESSAGES, ORDER_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { addressIdSchema } from '~/middlewares/addresses.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const statuses = numberEnumToArray(OrderStatus)

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
      },
      addressId: addressIdSchema
    },
    ['body']
  )
)

export const orderIdValidator = validate(
  checkSchema(
    {
      orderId: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.ORDER_ID_IS_REQUIRED
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ORDER_MESSAGES.ORDER_ID_IS_INVALID
              })
            }
            const order = await databaseService.orders.findOne({
              _id: new ObjectId(value)
            })
            if (!order) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: ORDER_MESSAGES.ORDER_NOT_FOUND
              })
            }
            ;(req as Request).order = order
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const orderAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  if (req.order?.userId.toString() !== userId) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: UTILS_MESSAGES.PERMISSION_DENIED
      })
    )
  }
  next()
}

export const orderAuthorOrAdminValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, userRole } = req.decodedAuthorization as TokenPayload
  if (req.order?.userId.toString() !== userId && userRole !== UserRole.Admin) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: UTILS_MESSAGES.PERMISSION_DENIED
      })
    )
  }
  next()
}

export const updateOrderValidator = validate(
  checkSchema(
    {
      status: {
        isIn: {
          options: [statuses],
          errorMessage: ORDER_MESSAGES.ORDER_STATUS_IS_INVALID
        }
      }
    },
    ['body']
  )
)
