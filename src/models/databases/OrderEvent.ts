import { ObjectId } from 'mongodb'

type OrderEventConstructor = {
  _id?: ObjectId
  orderId: ObjectId
  content: string
  createdAt?: Date
  updatedAt?: Date
}

export default class OrderEvent {
  _id: ObjectId
  orderId: ObjectId
  content: string
  createdAt: Date
  updatedAt: Date

  constructor({ _id = new ObjectId(), orderId, content, createdAt, updatedAt }: OrderEventConstructor) {
    const date = new Date()
    this._id = _id
    this.orderId = orderId
    this.content = content
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
