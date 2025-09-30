import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'

import { validate } from '~/utils/validation'

export const createFolderValidator = validate(
  checkSchema(
    {
      name: {
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
      },
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
