import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { checkSchema, ParamSchema } from 'express-validator'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { UserRole } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import User from '~/models/databases/User'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload, VerifyEmailTokenReqBody } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { hashPassword } from '~/utils/crypto'
import { numberEnumToArray } from '~/utils/helpers'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validation'

const userRoles = numberEnumToArray(UserRole)

const emailSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
  },
  isEmail: {
    errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
  }
}

const passwordSchema: ParamSchema = {
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
}

const confirmPasswordSchema: ParamSchema = {
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
}

// Đăng ký tài khoản
export const registerValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
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
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
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

// Đăng nhập
export const loginValidator = validate(
  checkSchema(
    {
      email: emailSchema,
      password: {
        ...passwordSchema,
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({
              email: req.body.email,
              password: hashPassword(value)
            })
            if (!user) {
              throw new Error(USERS_MESSAGES.INVALID_EMAIL_OR_PASSWORD)
            }
            ;(req as Request).user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refreshToken: {
        trim: true,
        custom: {
          options: async (value: string, { req }) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const [refreshToken, decodedRefreshToken] = await Promise.all([
                databaseService.refreshTokens.findOne({ token: value }),
                verifyToken({
                  token: value,
                  secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
                })
              ])
              if (!refreshToken) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_DOES_NOT_EXIST,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              ;(req as Request).decodedRefreshToken = decodedRefreshToken
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const accessToken = value?.split(' ')[1]
            if (!accessToken) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            try {
              const decodedAuthorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN
              })
              ;(req as Request).decodedAuthorization = decodedAuthorization
              return true
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                })
              }
              throw error
            }
          }
        }
      }
    },
    ['headers']
  )
)

export const updateMeValidator = validate(
  checkSchema(
    {
      fullName: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.FULLNAME_IS_REQUIRED
        },
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: USERS_MESSAGES.FULLNAME_LENGTH_IS_INVALID
        }
      },
      avatar: {
        trim: true,
        optional: true,
        isMongoId: {
          errorMessage: USERS_MESSAGES.AVATAR_ID_IS_INVALID
        }
      }
    },
    ['body']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      oldPassword: {
        trim: true,
        notEmpty: {
          errorMessage: USERS_MESSAGES.OLD_PASSWORD_IS_REQUIRED
        },
        custom: {
          options: async (value: string, { req }) => {
            const { userId } = (req as Request).decodedAuthorization as TokenPayload
            const user = (await databaseService.users.findOne({
              _id: new ObjectId(userId)
            })) as WithId<User>
            const isValid = hashPassword(value) === user.password
            if (!isValid) {
              throw new Error(USERS_MESSAGES.OLD_PASSWORD_IS_INVALID)
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        ...emailSchema,
        custom: {
          options: async (value: string, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (!user) {
              throw new Error(USERS_MESSAGES.EMAIL_DOES_NOT_EXIST)
            }
            ;(req as Request).user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)
