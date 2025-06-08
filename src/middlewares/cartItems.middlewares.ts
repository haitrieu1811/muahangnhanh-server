import { checkSchema } from 'express-validator'

import { CART_MESSAGES } from '~/constants/message'
import { validate } from '~/utils/validation'

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
