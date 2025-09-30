import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { UTILS_MESSAGES } from '~/constants/message'
import { generateCollectionIdValidator } from '~/middlewares/utils.middlewares'
import Folder from '~/models/databases/Folder'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

const nameSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: 'Tên thư mục là bắt buộc.'
  },
  isLength: {
    options: {
      min: 1,
      max: 240
    },
    errorMessage: 'Tên thư mục phải dài từ 1 đến 240 ký tự.'
  }
}

export const createFolderValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      parentId: {
        trim: true,
        optional: true,
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: 'ID thư mục cha không hợp lệ.'
              })
            }
            const folder = await databaseService.folders.findOne({
              _id: new ObjectId(value)
            })
            if (!folder) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Không tìm thấy thư mục cha.'
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const updateFolderValidator = validate(
  checkSchema(
    {
      name: nameSchema
    },
    ['body']
  )
)

export const folderIdValidator = generateCollectionIdValidator<Folder>({
  field: 'folderId',
  collection: databaseService.folders,
  emptyErrorMessage: 'ID thư mục là bắt buộc.',
  invalidErrorMessage: 'ID thư mục không hợp lệ.',
  notFoundErrorMessage: 'Không tìm thấy thư mục',
  onPass: ({ req, document }) => {
    req.folder = document
  }
})

export const folderAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const folder = req.folder as Folder
  if (folder.userId.toString() !== userId) {
    next(
      new ErrorWithStatus({
        message: UTILS_MESSAGES.PERMISSION_DENIED,
        status: HTTP_STATUS.FORBIDDEN
      })
    )
  }
  next()
}
