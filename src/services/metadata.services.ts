import { ObjectId } from 'mongodb'
import { ParamsDictionary } from 'express-serve-static-core'

import Metadata from '~/models/databases/Metadata'
import databaseService from '~/services/database.services'

export type CreateMetadataReqBody = {
  title: string
  description: string
}

export type MetadataDocumentIdReqParams = ParamsDictionary & {
  documentId: string
}

export type MetadataIdReqParams = ParamsDictionary & {
  metadataId: string
}

class MetadataService {
  async insertOne({ body, documentId }: { body: CreateMetadataReqBody; documentId: ObjectId }) {
    const { insertedId } = await databaseService.metadata.insertOne(
      new Metadata({
        ...body,
        documentId
      })
    )
    const metadata = await databaseService.metadata.findOne({
      _id: insertedId
    })
    return {
      metadata
    }
  }

  async updateOne({ body, metadataId }: { body: CreateMetadataReqBody; metadataId: ObjectId }) {
    const metadata = await databaseService.metadata.findOneAndUpdate(
      {
        _id: metadataId
      },
      {
        $set: body,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      metadata
    }
  }
}

const metadataService = new MetadataService()
export default metadataService
