import { Router } from 'express'

import { deleteImageController, getImagesController, uploadImagesController } from '~/controllers/medias.controllers'
import {
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  isVerifiedUserValidator
} from '~/middlewares/users.middlewares'
import { imageIdValidator, paginationValidator } from '~/middlewares/utils.middlewares'

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

mediasRouter.delete(
  '/images/:imageId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  imageIdValidator,
  deleteImageController
)

export default mediasRouter
