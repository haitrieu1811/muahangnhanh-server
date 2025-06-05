import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADDRESS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const provinceIdValidator = validate(
  checkSchema(
    {
      provinceId: {
        trim: true,
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ADDRESS_MESSAGES.PROVINCE_ID_IS_REQUIRED
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: ADDRESS_MESSAGES.PROVINCE_ID_IS_INVALID
              })
            }
            const province = await databaseService.provinces.findOne({
              _id: new ObjectId(value)
            })
            if (!province) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: ADDRESS_MESSAGES.PROVINCE_NOT_FOUND
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
