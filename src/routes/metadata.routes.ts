import { Router } from 'express'

import { createMetadataController, updateMetadataController } from '~/controllers/metadata.controllers'
import {
  createMetadataValidator,
  metadataDocumentDoesNotExistValidator,
  metadataDocumentIdValidator,
  metadataIdValidator
} from '~/middlewares/metadata.middlewares'
import { accessTokenValidator, isActiveUserValidator, isAdminValidator } from '~/middlewares/users.middlewares'

const metadataRouter = Router()

metadataRouter.post(
  '/documents/:documentId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  metadataDocumentIdValidator,
  metadataDocumentDoesNotExistValidator,
  createMetadataValidator,
  createMetadataController
)

metadataRouter.put(
  '/:metadataId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  metadataIdValidator,
  createMetadataValidator,
  updateMetadataController
)

export default metadataRouter
