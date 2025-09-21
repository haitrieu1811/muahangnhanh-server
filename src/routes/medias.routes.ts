import { Router } from 'express'

import { getImagesController, uploadImagesController } from '~/controllers/medias.controllers'
import {
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  isVerifiedUserValidator
} from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-images',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  uploadImagesController
)

mediasRouter.get(
  '/images',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  paginationValidator,
  getImagesController
)

export default mediasRouter
