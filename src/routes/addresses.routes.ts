import { Router } from 'express'

import {
  createAddressController,
  getAddressController,
  getMyAddressesController
} from '~/controllers/addresses.controllers'
import { addressAuthorValidator, addressIdValidator, createAddressValidator } from '~/middlewares/addresses.middlewares'
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

addressesRouter.get(
  '/:addressId',
  accessTokenValidator,
  isVerifiedUserValidator,
  addressIdValidator,
  addressAuthorValidator,
  getAddressController
)

export default addressesRouter
