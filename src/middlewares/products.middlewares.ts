import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { productCategoryIdSchema } from '~/middlewares/productCategories.middlewares'
import { imageIdSchema } from '~/middlewares/utils.middlewares'
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
