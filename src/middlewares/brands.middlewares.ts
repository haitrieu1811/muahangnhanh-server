import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const createBrandValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.BRAND_NAME_IS_REQUIRED
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

export const brandIdValidator = validate(
  checkSchema(
    {
      brandId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const brand = await databaseService.brands.findOne({
              _id: new ObjectId(value)
            })
            if (!brand) {
              throw new ErrorWithStatus({
                message: PRODUCTS_MESSAGES.BRAND_NOT_EXIST,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
