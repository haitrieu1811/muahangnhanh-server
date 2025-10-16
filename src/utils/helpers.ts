import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'

import { ENV_CONFIG } from '~/constants/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import { verifyToken } from '~/utils/jwt'

export const generateRandomString = (length: number): string => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((item) => typeof item === 'number') as number[]
}

// Cấu hình phân trang
export const configurePagination = (query: PaginationReqQuery) => {
  const { page, limit } = query
  const _page = Number(page) || 1
  const _limit = Number(limit) || 20
  const skip = (_page - 1) * _limit
  return {
    page: _page,
    limit: _limit,
    skip
  }
}

export const verifyAccessToken = async (accessToken: string, req?: Request) => {
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
    if (req) {
      req.decodedAuthorization = decodedAuthorization
      return true
    }
    return decodedAuthorization
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
