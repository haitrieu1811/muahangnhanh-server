import { checkSchema } from 'express-validator'

import { UserRole } from '~/constants/enum'
import { USERS_MESSAGES } from '~/constants/message'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const userRoles = numberEnumToArray(UserRole)

export const registerValidator = validate(
  checkSchema(
    {
      email: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value: string) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXIST)
            }
            return true
          }
        }
      },
      password: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 8,
            max: 32
          },
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_INVALID
        },
        isStrongPassword: {
          options: {
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
          },
          errorMessage: USERS_MESSAGES.PASSWORD_IS_NOT_STRONG_ENOUGH
        }
      },
      confirmPassword: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        custom: {
          options: (value: string, { req }) => {
            if (value !== req.body.password) {
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_IS_NOT_MATCH)
            }
            return true
          }
        }
      },
      role: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ROLE_IS_REQUIRED
        },
        isIn: {
          options: [userRoles],
          errorMessage: USERS_MESSAGES.ROLE_IS_INVALID
        }
      }
    },
    ['body']
  )
)
