import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { generateCollectionIdValidator } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { MetadataDocumentIdReqParams, MetadataIdReqParams } from '~/services/metadata.services'
import { validate } from '~/utils/validation'

export const createMetadataValidator = validate(
  checkSchema({
    title: {
      trim: true,
      notEmpty: {
        errorMessage: 'Metadata title là bắt buộc.'
      },
      isLength: {
        options: {
          min: 30,
          max: 65
        },
        errorMessage: 'Metadata title nên có độ dài từ 30 đến 65 ký tự.'
      }
    },
    description: {
      trim: true,
      notEmpty: {
        errorMessage: 'Metadata description là bắt buộc.'
      },
      isLength: {
        options: {
          min: 120,
          max: 320
        },
        errorMessage: 'Metadata description nên có độ dài từ 120 đến 320 ký tự.'
      }
    }
  })
)

export const metadataDocumentIdValidator = validate(
  checkSchema(
    {
      documentId: {
        trim: true,
        custom: {
          options: async (value: string) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: 'Document ID là bắt buộc.'
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: 'Document ID không hợp lệ.'
              })
            }
            const [product, blog] = await Promise.all([
              databaseService.products.findOne({
                _id: new ObjectId(value)
              }),
              databaseService.blogs.findOne({
                _id: new ObjectId(value)
              })
            ])
            if (!product && !blog) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'Không tìm thấy document.'
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

export const metadataIdValidator = generateCollectionIdValidator({
  field: 'metadataId',
  collection: databaseService.metadata,
  emptyErrorMessage: 'Metadata ID là bắt buộc.',
  invalidErrorMessage: 'Metadata ID không hợp lệ.',
  notFoundErrorMessage: 'Không tìm thấy metadata.'
})

export const metadataDocumentDoesNotExistValidator = async (
  req: Request<MetadataDocumentIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const metadata = await databaseService.metadata.findOne({
    documentId: new ObjectId(req.params.documentId)
  })
  if (metadata) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: 'Document đã tồn tại metadata.'
      })
    )
  }
  next()
}

export const metadataAlreadyExistValidator = async (
  req: Request<MetadataIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const metadata = await databaseService.metadata.findOne({
    _id: new ObjectId(req.params.metadataId)
  })
  if (!metadata) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: 'Không tìm thấy metadata.'
      })
    )
  }
  next()
}
