import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'

import { ENV_CONFIG } from '~/constants/config'
import { UserRole } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { VerifyEmailTokenReqBody } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/helpers'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const userRoles = numberEnumToArray(UserRole)

// Đăng ký tài khoản
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

// Kiểm tra verify email token hợp lệ hay không
export const verifyEmailTokenValidator = async (
  req: Request<ParamsDictionary, any, VerifyEmailTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { verifyEmailToken } = req.body
  if (!verifyEmailToken) {
    next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_IS_REQUIRED,
        status: HTTP_STATUS.UNAUTHORIZED
      })
    )
  }
  try {
    const [decodedVerifyEmailToken, user] = await Promise.all([
      verifyToken({
        token: verifyEmailToken,
        secretOrPublicKey: ENV_CONFIG.JWT_SECRET_VERIFY_EMAIL_TOKEN
      }),
      databaseService.users.findOne({
        verifyEmailToken
      })
    ])
    if (!user) {
      next(
        new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_NOT_EXIST
        })
      )
    }
    req.decodedVerifyEmailToken = decodedVerifyEmailToken
    next()
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      next(
        new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: capitalize(error.message)
        })
      )
    }
    next(error)
  }
}
