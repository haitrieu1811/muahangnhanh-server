import { ObjectId } from 'mongodb'
import { ProductCategoryStatus } from '~/constants/enum'

type ProductCategoryConstructor = {
  _id?: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  name: string
  description?: string
  status?: ProductCategoryStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class ProductCategory {
  _id: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  name: string
  description: string
  status: ProductCategoryStatus
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, thumbnail, name, description, status, createdAt, updatedAt }: ProductCategoryConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.thumbnail = thumbnail
    this.name = name
    this.description = description ?? ''
    this.status = status ?? ProductCategoryStatus.Active
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
