import { ObjectId } from 'mongodb'

import { MediaType } from '~/constants/enum'

type MediaConstructor = {
  _id?: ObjectId
  userId: ObjectId
  name: string
  type: MediaType
  createdAt?: Date
  updatedAt?: Date
}

export default class Media {
  _id: ObjectId
  userId: ObjectId
  name: string
  type: MediaType
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, name, type, createdAt, updatedAt }: MediaConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.name = name
    this.type = type
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
