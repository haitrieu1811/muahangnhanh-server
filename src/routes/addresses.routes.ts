import { Router } from 'express'

import { createAddressController, getMyAddressesController } from '~/controllers/addresses.controllers'
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

addressesRouter.get('/me', accessTokenValidator, isVerifiedUserValidator, getMyAddressesController)

export default addressesRouter
