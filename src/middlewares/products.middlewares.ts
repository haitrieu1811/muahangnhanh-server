import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { productCategoryIdSchema } from '~/middlewares/productCategories.middlewares'
import { starPointsSchema } from '~/middlewares/reviews.middlewares'
import { imageIdSchema } from '~/middlewares/utils.middlewares'
import Product from '~/models/databases/Product'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const priceSchema: ParamSchema = {
  custom: {
    options: (value) => {
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error(PRODUCTS_MESSAGES.PRODUCT_PRICE_MUST_BE_A_INT_GREATER_THAN_ZERO)
      }
      return true
    }
  }
}

export const createProductValidator = validate(
  checkSchema(
    {
      thumbnail: imageIdSchema,
      photos: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Array.isArray(value)) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_PHOTOS_MUST_BE_AN_ARRAY)
            }
            const isValid = value.every((item) => ObjectId.isValid(item))
            if (!isValid) {
              throw new Error(PRODUCTS_MESSAGES.PRODUCT_PHOTOS_IS_INVALID)
            }
            return true
          }
        }
      },
      name: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 10,
            max: 120
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_NAME_LENGTH_IS_INVALID
        }
      },
      description: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_DESCRIPTION_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 100
          },
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_DESCRIPTION_LENGTH_IS_INVALID
        }
      },
      price: {
        ...priceSchema,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_PRICE_IS_REQUIRED
        }
      },
      priceAfterDiscount: {
        ...priceSchema,
        optional: true
      },
      categoryId: {
        ...productCategoryIdSchema,
        optional: true
      }
    },
    ['body']
  )
)

export const productIdValidator = validate(
  checkSchema(
    {
      productId: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const product = await databaseService.products.findOne({
              _id: new ObjectId(value)
            })
            if (!product) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.PRODUCT_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            ;(req as Request).product = product
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const productAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const product = req.product as Product
  if (product.userId.toString() !== userId) {
    next(
      new ErrorWithStatus({
        message: UTILS_MESSAGES.PERMISSION_DENIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}

export const getProductsValidator = validate(
  checkSchema(
    {
      categoryIds: {
        trim: true,
        optional: true,
        custom: {
          options: (value: string) => {
            const categoryIds = value.split('-')
            const isAllValid = categoryIds.every((categoryId) => ObjectId.isValid(categoryId))
            if (!isAllValid) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_ID_IS_INVALID
              })
            }
            return true
          }
        }
      },
      minStarPoints: {
        ...starPointsSchema,
        optional: true
      },
      isFlashSale: {
        optional: true,
        isBoolean: {
          errorMessage: PRODUCTS_MESSAGES.IS_FLASH_SALE_IS_INVALID
        },
        customSanitizer: {
          options: (value: string) => {
            if (value === 'true') return true
            if (value === 'false') return false
            return value
          }
        }
      },
      isActive: {
        optional: true,
        isBoolean: {
          errorMessage: PRODUCTS_MESSAGES.IS_ACTIVE_IS_INVALID
        },
        customSanitizer: {
          options: (value: string) => {
            if (value === 'true') return true
            if (value === 'false') return false
            return value
          }
        }
      },
      orderBy: {
        trim: true,
        optional: true,
        isIn: {
          options: [['asc', 'desc']],
          errorMessage: PRODUCTS_MESSAGES.ORDER_BY_IS_INVALID
        }
      },
      name: {
        trim: true,
        optional: true
      },
      sortBy: {
        trim: true,
        optional: true
      }
    },
    ['query']
  )
)
