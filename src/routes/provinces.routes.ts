import { Router } from 'express'

import { getCommunesController, getProvincesController } from '~/controllers/addresses.controllers'
import { provinceIdValidator } from '~/middlewares/addresses.middlewares'

const provincesRouter = Router()

provincesRouter.get('/', getProvincesController)

provincesRouter.get('/:provinceId/communes', provinceIdValidator, getCommunesController)

export default provincesRouter
