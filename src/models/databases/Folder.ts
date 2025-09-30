import { ObjectId } from 'mongodb'

type FolderConstructor = {
  _id?: ObjectId
  userId: ObjectId
  parentId?: ObjectId
  name: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Folder {
  _id: ObjectId
  userId: ObjectId
  parentId: ObjectId | null
  name: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id = new ObjectId(), userId, parentId, name, createdAt, updatedAt }: FolderConstructor) {
    const date = new Date()
    this._id = _id
    this.userId = userId
    this.parentId = parentId ?? null
    this.name = name
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
