import { Router } from 'express'

import { createFolderController, updateFolderController } from '~/controllers/folders.controllers'
import {
  createFolderValidator,
  folderAuthorValidator,
  folderIdValidator,
  updateFolderValidator
} from '~/middlewares/folders.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'

const foldersRouer = Router()

foldersRouer.post('/', accessTokenValidator, createFolderValidator, createFolderController)

foldersRouer.put(
  '/:folderId',
  accessTokenValidator,
  folderIdValidator,
  folderAuthorValidator,
  updateFolderValidator,
  updateFolderController
)

export default foldersRouer
