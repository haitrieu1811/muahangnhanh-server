import { Request } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { Collection, ObjectId, WithId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIAS_MESSAGES, UTILS_MESSAGES } from '~/constants/message'
import { ErrorWithStatus } from '~/models/Error'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const imageIdSchema: ParamSchema = {
  trim: true,
  notEmpty: {
    errorMessage: UTILS_MESSAGES.IMAGE_ID_IS_REQUIRED
  },
  isMongoId: {
    errorMessage: UTILS_MESSAGES.IMAGE_ID_IS_INVALID
  }
}

export const paginationValidator = validate(
  checkSchema(
    {
      page: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.PAGE_MUST_BE_AN_INTEGER,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value <= 0) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.PAGE_MUST_BE_GREATER_THAN_ZERO,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      limit: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.LIMIT_MUST_BE_AN_INTEGER,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value < 0) {
              throw new ErrorWithStatus({
                message: UTILS_MESSAGES.LIMIT_MUST_BE_GREATER_THAN_OR_EQUAL_ZERO,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)

export const imageIdValidator = validate(
  checkSchema(
    {
      imageId: {
        trim: true,
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                message: MEDIAS_MESSAGES.IMAGE_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: MEDIAS_MESSAGES.IMAGE_ID_IS_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const image = await databaseService.medias.findOne({
              _id: new ObjectId(value)
            })
            if (!image) {
              throw new ErrorWithStatus({
                message: MEDIAS_MESSAGES.IMAGE_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
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

export const generateCollectionIdValidator = <Document = any>({
  field,
  collection,
  emptyErrorMessage,
  invalidErrorMessage,
  notFoundErrorMessage,
  onPass
}: {
  field: string
  collection: Collection<any>
  emptyErrorMessage: string
  invalidErrorMessage: string
  notFoundErrorMessage: string
  onPass?: ({ req, document }: { req: Request; document: WithId<Document> }) => void
}) =>
  validate(
    checkSchema(
      {
        [field]: {
          trim: true,
          custom: {
            options: async (value, { req }) => {
              if (!value) {
                throw new ErrorWithStatus({
                  message: emptyErrorMessage,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
              if (!ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                  message: invalidErrorMessage,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
              const document = await collection.findOne({
                _id: new ObjectId(value)
              })
              if (!document) {
                throw new ErrorWithStatus({
                  message: notFoundErrorMessage,
                  status: HTTP_STATUS.NOT_FOUND
                })
              }
              onPass?.({
                req: req as Request,
                document: document as WithId<Document>
              })
              return true
            }
          }
        }
      },
      ['params']
    )
  )
