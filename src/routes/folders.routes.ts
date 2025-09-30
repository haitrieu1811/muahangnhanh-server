import { Router } from 'express'

import { createFolderController, getFoldersController, updateFolderController } from '~/controllers/folders.controllers'
import {
  createFolderValidator,
  folderAuthorValidator,
  folderIdValidator,
  updateFolderValidator
} from '~/middlewares/folders.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const foldersRouer = Router()

foldersRouer.post('/', accessTokenValidator, createFolderValidator, createFolderController)

foldersRouer.put(
  '/:folderId',
  accessTokenValidator,
  isVerifiedUserValidator,
  folderIdValidator,
  folderAuthorValidator,
  updateFolderValidator,
  updateFolderController
)

foldersRouer.get('/me', accessTokenValidator, isVerifiedUserValidator, getFoldersController)

export default foldersRouer
