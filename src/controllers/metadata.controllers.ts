import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import metadataService, {
  CreateMetadataReqBody,
  MetadataDocumentIdReqParams,
  MetadataIdReqParams
} from '~/services/metadata.services'

export const createMetadataController = async (
  req: Request<MetadataDocumentIdReqParams, any, CreateMetadataReqBody>,
  res: Response
) => {
  const data = await metadataService.insertOne({ body: req.body, documentId: new ObjectId(req.params.documentId) })
  res.json({
    message: 'Tạo metdata thành công.',
    data
  })
}

export const updateMetadataController = async (
  req: Request<MetadataIdReqParams, any, CreateMetadataReqBody>,
  res: Response
) => {
  const data = await metadataService.updateOne({ body: req.body, metadataId: new ObjectId(req.params.metadataId) })
  res.json({
    message: 'Cập nhật metdata thành công.',
    data
  })
}
