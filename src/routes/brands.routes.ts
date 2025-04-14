import { Router } from 'express'

import {
  createBrandController,
  deleteBrandController,
  getBrandsController,
  updateBrandController
} from '~/controllers/brands.controllers'
import { brandIdValidator, createBrandValidator } from '~/middlewares/brands.middlewares'

import {
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  isVerifiedUserValidator
} from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const brandsRouter = Router()

brandsRouter.post(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  createBrandValidator,
  createBrandController
)

brandsRouter.put(
  '/:brandId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  brandIdValidator,
  createBrandValidator,
  updateBrandController
)

brandsRouter.delete(
  '/:brandId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isActiveUserValidator,
  isAdminValidator,
  brandIdValidator,
  deleteBrandController
)

brandsRouter.get('/', paginationValidator, getBrandsController)

export default brandsRouter
