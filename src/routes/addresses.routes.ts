import { Router } from 'express'

import { createAddressController } from '~/controllers/addresses.controllers'
import { createAddressValidator } from '~/middlewares/addresses.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const addressesRouter = Router()

addressesRouter.post(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  createAddressValidator,
  createAddressController
)

export default addressesRouter
