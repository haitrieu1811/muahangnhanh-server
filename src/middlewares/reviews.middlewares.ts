import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { OrderStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVIEWS_MESSAGE } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { ProductIdReqParams } from '~/models/requests/products.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createReviewValidator = validate(
  checkSchema(
    {
      starPoints: {
        notEmpty: {
          errorMessage: REVIEWS_MESSAGE.STAR_POINTS_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!Number.isInteger(value)) {
              throw new Error(REVIEWS_MESSAGE.STAR_POINTS_MUST_BE_AN_INTEGER)
            }
            if (value < 1 || value > 5) {
              throw new Error(REVIEWS_MESSAGE.STAR_POINTS_IS_INVALID)
            }
            return true
          }
        }
      },
      content: {
        trim: true,
        optional: true
      },
      photos: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) {
              throw new Error(REVIEWS_MESSAGE.PHOTOS_MUST_BE_AN_ARRAY)
            }
            const isValid = value.every((item) => ObjectId.isValid(item))
            if (!isValid) {
              throw new Error(REVIEWS_MESSAGE.PHOTOS_IS_INVALID)
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

// Kiểm tra sản phẩm đã được mua chưa
export const isPurchasedBeforeValidator = async (
  req: Request<ProductIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const orderProducts = await databaseService.orders
    .aggregate([
      {
        $match: {
          userId: new ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: 'cartItems',
          localField: 'items',
          foreignField: '_id',
          as: 'cartItems'
        }
      },
      {
        $unwind: {
          path: '$cartItems'
        }
      },
      {
        $addFields: {
          'cartItems.orderStatus': '$status'
        }
      },
      {
        $replaceRoot: {
          newRoot: '$cartItems'
        }
      }
    ])
    .toArray()
  const successOrderProducts = orderProducts.filter(
    (item) => item.orderStatus === OrderStatus.Success && item.productId.toString() === req.params.productId
  )
  if (successOrderProducts.length === 0) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: REVIEWS_MESSAGE.PLEASE_BUY_BEFORE_REVIEW
      })
    )
  }
  next()
}

// Kiểm tra người dùng chưa đánh giá trước đó
export const isHasNotReviewdValidator = async (req: Request<ProductIdReqParams>, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const review = await databaseService.reviews.findOne({
    userId: new ObjectId(userId),
    productId: new ObjectId(req.params.productId)
  })
  if (review) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: REVIEWS_MESSAGE.YOU_HAVE_REVIEWED_BEFORE
      })
    )
  }
  next()
}
