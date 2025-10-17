import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import { BlogStatus } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { BLOGS_MESSAGE } from '~/constants/message'
import { imageIdSchema } from '~/middlewares/utils.middlewares'
import Blog from '~/models/databases/Blog'
import { ErrorWithStatus } from '~/models/Error'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { numberEnumToArray, verifyMongoDocumentAuthor, verifyMongoDocumentId } from '~/utils/helpers'
import { validate } from '~/utils/validation'

const statuses = numberEnumToArray(BlogStatus)

export const createBlogValidator = validate(
  checkSchema(
    {
      title: {
        trim: true,
        notEmpty: {
          errorMessage: BLOGS_MESSAGE.BLOG_TITLE_IS_REQUIRED
        }
      },
      content: {
        trim: true,
        notEmpty: {
          errorMessage: BLOGS_MESSAGE.BLOG_CONTENT_IS_REQUIRED
        }
      },
      status: {
        optional: true,
        isIn: {
          options: [statuses],
          errorMessage: BLOGS_MESSAGE.BLOG_STATUS_IS_INVALID
        }
      },
      order: {
        optional: true,
        custom: {
          options: (value) => {
            if (!Number.isInteger(Number(value))) {
              throw new Error(BLOGS_MESSAGE.BLOG_ORDER_MUST_BE_A_INT)
            }
            if (value < 0) {
              throw new Error(BLOGS_MESSAGE.BLOG_ORDER_MUST_BE_GREATER_THAN_ZERO)
            }
            return true
          }
        }
      },
      thumbnail: imageIdSchema
    },
    ['body']
  )
)

export const blogIdValidator = validate(
  checkSchema(
    {
      blogId: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const result = await verifyMongoDocumentId<Blog>({
              documentId: value,
              collection: databaseService.blogs,
              emptyErrorMessage: BLOGS_MESSAGE.BLOG_IDS_IS_REQUIRED,
              invalidErrorMessage: BLOGS_MESSAGE.BLOG_IDS_IS_INVALID,
              notFoundErrorMessage: BLOGS_MESSAGE.BLOG_NOT_FOUND
            })
            ;(req as Request).blog = result
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const blogAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.decodedAuthorization as TokenPayload
    const blog = req.blog as Blog
    verifyMongoDocumentAuthor({
      userId,
      documentUserId: blog.userId.toString(),
      errorMessage: 'Bạn không phải là người tạo blog này.'
    })
    next()
  } catch (error) {
    next(error)
  }
}

export const deleteBlogsValidator = validate(
  checkSchema(
    {
      blogIds: {
        custom: {
          options: async (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: BLOGS_MESSAGE.BLOG_IDS_IS_REQUIRED
              })
            }
            if (!Array.isArray(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: BLOGS_MESSAGE.BLOG_IDS_MUST_BE_AN_ARRAY
              })
            }
            const isAllValid = value.every((id) => ObjectId.isValid(id))
            if (!isAllValid) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: BLOGS_MESSAGE.BLOG_IDS_IS_INVALID
              })
            }
            const blogs = await Promise.all(
              value.map(
                async (blogId) =>
                  await databaseService.blogs.findOne({
                    _id: new ObjectId(blogId)
                  })
              )
            )
            if (!blogs.every((blog) => blog !== null)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: BLOGS_MESSAGE.BLOG_NOT_FOUND
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
