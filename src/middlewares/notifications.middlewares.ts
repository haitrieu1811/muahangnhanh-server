import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'

import Notification from '~/models/databases/Notification'
import { TokenPayload } from '~/models/requests/users.requests'
import databaseService from '~/services/database.services'
import { verifyMongoDocumentAuthor, verifyMongoDocumentId } from '~/utils/helpers'
import { validate } from '~/utils/validation'

export const notificationIdValidator = validate(
  checkSchema(
    {
      notificationId: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const result = await verifyMongoDocumentId<Notification>({
              collection: databaseService.notifications,
              documentId: value
            })
            ;(req as Request).notification = result
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const notificationAuthorValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.decodedAuthorization as TokenPayload
    const notification = req.notification as Notification
    verifyMongoDocumentAuthor({
      userId,
      documentUserId: notification.userId.toString(),
      errorMessage: 'Thông báo này là của một tài khoản khác.'
    })
    next()
  } catch (error) {
    next(error)
  }
}
