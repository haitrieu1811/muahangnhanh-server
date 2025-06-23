import { ObjectId } from 'mongodb'

type ReviewConstructor = {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  starPoints: number
  photos?: ObjectId[]
  content?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Review {
  _id: ObjectId
  userId: ObjectId
  productId: ObjectId
  starPoints: number
  photos: ObjectId[]
  content: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, productId, starPoints, photos, content, createdAt, updatedAt }: ReviewConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.productId = productId
    this.starPoints = starPoints
    this.photos = photos ?? []
    this.content = content ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
