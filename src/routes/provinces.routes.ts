import { Router } from 'express'

import { getDistrictsController, getProvincesController, getWardsController } from '~/controllers/addresses.controllers'
import { provinceIdValidator } from '~/middlewares/addresses.middlewares'

const provincesRouter = Router()

provincesRouter.get('/', getProvincesController)

provincesRouter.get('/:provinceId/districts', provinceIdValidator, getDistrictsController)

provincesRouter.get('/:provinceId/districts/:districtId/wards', provinceIdValidator, getWardsController)

export default provincesRouter
