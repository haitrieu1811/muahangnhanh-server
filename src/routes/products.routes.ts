import { Router } from 'express'

import { createProductController } from '~/controllers/products.controllers'
import { createProductValidator } from '~/middlewares/products.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const productsRouter = Router()

productsRouter.post('/', accessTokenValidator, createProductValidator, createProductController)

export default productsRouter
