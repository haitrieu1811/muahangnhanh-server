import { checkSchema } from 'express-validator'

import HTTP_STATUS from '~/constants/httpStatus'
import { UTILS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.PAGE_MUST_BE_AN_INTEGER,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value <= 0) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.PAGE_MUST_BE_GREATER_THAN_ZERO,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      limit: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.LIMIT_MUST_BE_AN_INTEGER,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value < 0) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.LIMIT_MUST_BE_GREATER_THAN_OR_EQUAL_ZERO,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
