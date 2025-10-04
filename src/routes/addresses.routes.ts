import { Router } from 'express'

import {
  createAddressController,
  deleteAddressController,
  getMyAddressesController,
  setDefaultAddressController,
  updateAddressController
} from '~/controllers/addresses.controllers'
import { addressAuthorValidator, addressIdValidator, createAddressValidator } from '~/middlewares/addresses.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const addressesRouter = Router()

addressesRouter.post('/', accessTokenValidator, createAddressValidator, createAddressController)

addressesRouter.get('/me', accessTokenValidator, getMyAddressesController)

addressesRouter.put(
  '/:addressId',
  accessTokenValidator,
  addressIdValidator,
  addressAuthorValidator,
  createAddressValidator,
  updateAddressController
)

addressesRouter.delete(
  '/:addressId',
  accessTokenValidator,
  addressIdValidator,
  addressAuthorValidator,
  deleteAddressController
)

addressesRouter.post(
  '/:addressId/set-default',
  accessTokenValidator,
  addressIdValidator,
  addressAuthorValidator,
  setDefaultAddressController
)

export default addressesRouter
