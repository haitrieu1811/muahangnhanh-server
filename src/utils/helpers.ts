import { Request } from 'express'
import { JsonWebTokenError } from 'jsonwebtoken'
import capitalize from 'lodash/capitalize'
import { Collection, ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { UserRole } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
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

export const verifyMongoDocumentId = async <DocumentType>({
  documentId,
  collection,
  emptyErrorMessage = 'ID là bắt buộc.',
  invalidErrorMessage = 'ID không hợp lệ.',
  notFoundErrorMessage = 'Không tìm thấy bản ghi.'
}: {
  documentId: string
  collection: Collection<any>
  emptyErrorMessage?: string
  invalidErrorMessage?: string
  notFoundErrorMessage?: string
}) => {
  if (!documentId) {
    throw new ErrorWithStatus({
      message: emptyErrorMessage,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  if (!ObjectId.isValid(documentId)) {
    throw new ErrorWithStatus({
      message: invalidErrorMessage,
      status: HTTP_STATUS.BAD_REQUEST
    })
  }
  const document = (await collection.findOne({
    _id: new ObjectId(documentId)
  })) as WithId<DocumentType>
  if (!document) {
    throw new ErrorWithStatus({
      message: notFoundErrorMessage,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  return document
}

/**
 * Kiểm tra có phải người tạo bản ghi trong DB không
 * Nếu có truyền role và role là Admin thì cho truy cập vào cho
 * dù không phải là người tạo ra bản ghi
 */
export const verifyMongoDocumentAuthor = ({
  userId,
  documentUserId,
  errorMessage = UTILS_MESSAGES.PERMISSION_DENIED,
  role
}: {
  userId: string
  documentUserId: string
  errorMessage?: string
  role?: UserRole
}) => {
  if (role === UserRole.Admin) {
    return true
  }
  if (userId !== documentUserId) {
    throw new ErrorWithStatus({
      message: errorMessage,
      status: HTTP_STATUS.FORBIDDEN
    })
  }
  return true
}
