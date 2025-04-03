import { Router } from 'express'

import { uploadImagesController } from '~/controllers/medias.controllers'
import { accessTokenValidator, isActiveUserValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const mediasRouter = Router()

mediasRouter.post(
  '/upload-images',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  uploadImagesController
)

export default mediasRouter
