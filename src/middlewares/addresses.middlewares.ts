import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId, WithId } from 'mongodb'

import { AddressType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { ADDRESS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { PHONE_NUMBER_REGEX } from '~/constants/regex'
import Address from '~/models/databases/Address'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
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

export const addressIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value, { req }) => {
      if (!value) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: ADDRESS_MESSAGES.ADDRESS_ID_IS_REQUIRED
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: ADDRESS_MESSAGES.ADDRESS_ID_IS_INVALID
        })
      }
      const address = await databaseService.addresses.findOne({
        _id: new ObjectId(value)
      })
      if (!address) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: ADDRESS_MESSAGES.ADDRESS_NOT_FOUND
        })
      }
      ;(req as Request).address = address
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

export const addressIdValidator = validate(
  checkSchema(
    {
      addressId: addressIdSchema
    },
    ['params']
  )
)

export const addressAuthorValidator = async (req: Request, _: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const address = req.address as WithId<Address>
  if (address.userId.toString() !== userId) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.FORBIDDEN,
        message: UTILS_MESSAGES.PERMISSION_DENIED
      })
    )
  }
  next()
}
