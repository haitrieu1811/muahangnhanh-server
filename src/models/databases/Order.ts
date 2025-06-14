import { ObjectId } from 'mongodb'

import { OrderStatus } from '~/constants/enum'

type OrderConstructor = {
  _id?: ObjectId
  sellerId: ObjectId
  buyerId: ObjectId
  items: ObjectId[]
  totalItems: number
  totalAmount: number
  status?: OrderStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class Order {
  _id: ObjectId
  sellerId: ObjectId
  buyerId: ObjectId
  items: ObjectId[]
  totalItems: number
  totalAmount: number
  status: OrderStatus
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    sellerId,
    buyerId,
    items,
    totalItems,
    totalAmount,
    status,
    createdAt,
    updatedAt
  }: OrderConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.sellerId = sellerId
    this.buyerId = buyerId
    this.items = items
    this.totalItems = totalItems
    this.totalAmount = totalAmount
    this.status = status ?? OrderStatus.Waiting
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
