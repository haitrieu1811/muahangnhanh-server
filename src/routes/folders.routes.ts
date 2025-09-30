import { Router } from 'express'

import { createFolderController } from '~/controllers/folders.controllers'
import { createFolderValidator } from '~/middlewares/folders.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const foldersRouer = Router()

foldersRouer.post('/', accessTokenValidator, createFolderValidator, createFolderController)

export default foldersRouer
