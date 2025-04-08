import { checkSchema } from 'express-validator'

import { PRODUCTS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { validate } from '~/utils/validation'

export const createProductCategoryValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_NAME_IS_REQUIRED
        }
      },
      description: {
        trim: true,
        optional: true
      },
      thumbnail: {
        trim: true,
        notEmpty: {
          errorMessage: UTILS_MESSAGES.FILE_ID_IS_REQUIRED
        },
        isMongoId: {
          errorMessage: UTILS_MESSAGES.FILE_ID_IS_INVALID
        }
      }
    },
    ['body']
  )
)
