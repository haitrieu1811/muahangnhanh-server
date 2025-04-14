import { ObjectId } from 'mongodb'

type BrandConstructor = {
  _id?: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Brand {
  _id: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  name: string
  description: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, thumbnail, name, description, createdAt, updatedAt }: BrandConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.thumbnail = thumbnail
    this.name = name
    this.description = description ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
