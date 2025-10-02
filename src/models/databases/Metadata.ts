import { ObjectId } from 'mongodb'

type MetadataConstructor = {
  _id?: ObjectId
  documentId: ObjectId
  title: string
  description: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Metadata {
  _id: ObjectId
  documentId: ObjectId
  title: string
  description: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id = new ObjectId(), documentId, title, description, createdAt, updatedAt }: MetadataConstructor) {
    const date = new Date()
    this._id = _id
    this.documentId = documentId
    this.title = title
    this.description = description
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
