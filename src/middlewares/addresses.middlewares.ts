import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { AddressType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADDRESS_MESSAGES } from '~/constants/message'
import { PHONE_NUMBER_REGEX } from '~/constants/regex'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const provinceIdSchema: ParamSchema = {
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

const addressTypes = numberEnumToArray(AddressType)

export const provinceIdValidator = validate(
  checkSchema(
    {
      provinceId: provinceIdSchema
    },
    ['params']
  )
)

export const createAddressValidator = validate(
  checkSchema(
    {
      fullName: {
        trim: true,
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.ADDRESS_FULLNAME_IS_REQUIRED
        }
      },
      phoneNumber: {
        trim: true,
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.ADDRESS_PHONE_NUMBER_IS_REQUIRED
        },
        custom: {
          options: (value) => {
            if (!PHONE_NUMBER_REGEX.test(value)) {
              throw new Error(ADDRESS_MESSAGES.ADDRESS_PHONE_NUMBER_IS_INVALID)
            }
            return true
          }
        }
      },
      provinceId: provinceIdSchema,
      districtId: {
        trim: true,
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.DISTRICT_ID_IS_REQUIRED
        }
      },
      wardId: {
        trim: true,
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.WARD_ID_IS_REQUIRED
        }
      },
      detail: {
        trim: true,
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.ADDRESS_DETAIL_IS_REQUIRED
        }
      },
      type: {
        notEmpty: {
          errorMessage: ADDRESS_MESSAGES.ADDRESS_TYPE_IS_REQUIRED
        },
        isIn: {
          options: [addressTypes],
          errorMessage: ADDRESS_MESSAGES.ADDRESS_TYPE_IS_INVALID
        }
      }
    },
    ['body']
  )
)
