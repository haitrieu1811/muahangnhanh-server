import { ObjectId } from 'mongodb'

import { OrderStatus } from '~/constants/enum'

type OrderConstructor = {
  _id?: ObjectId
  userId: ObjectId
  items: ObjectId[]
  addressId: ObjectId
  totalItems: number
  totalAmount: number
  note?: string
  status?: OrderStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class Order {
  _id: ObjectId
  userId: ObjectId
  items: ObjectId[]
  addressId: ObjectId
  totalItems: number
  totalAmount: number
  note: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    items,
    addressId,
    totalItems,
    totalAmount,
    note,
    status,
    createdAt,
    updatedAt
  }: OrderConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.items = items
    this.addressId = addressId
    this.totalItems = totalItems
    this.totalAmount = totalAmount
    this.note = note ?? ''
    this.status = status ?? OrderStatus.Waiting
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
