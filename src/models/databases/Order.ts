import { ObjectId } from 'mongodb'

import { OrderStatus } from '~/constants/enum'
import { generateRandomString } from '~/utils/helpers'

type OrderConstructor = {
  _id?: ObjectId
  userId: ObjectId
  items: ObjectId[]
  addressId: ObjectId
  code?: string
  totalItems: number
  totalAmount: number
  note?: string
  status?: OrderStatus
  orderedAt?: Date
  confirmedAt?: Date | null
  shippedAt?: Date | null
  canceledAt?: Date | null
  succeededAt?: Date | null
  ratedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

export default class Order {
  _id: ObjectId
  userId: ObjectId
  items: ObjectId[]
  addressId: ObjectId
  code: string
  totalItems: number
  totalAmount: number
  note: string
  status: OrderStatus
  orderedAt: Date
  confirmedAt: Date | null
  shippedAt: Date | null
  canceledAt: Date | null
  succeededAt: Date | null
  ratedAt: Date | null
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    items,
    addressId,
    code,
    totalItems,
    totalAmount,
    note,
    status,
    orderedAt,
    confirmedAt,
    shippedAt,
    canceledAt,
    succeededAt,
    ratedAt,
    createdAt,
    updatedAt
  }: OrderConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.items = items
    this.addressId = addressId
    this.code = code ?? generateRandomString(14)
    this.totalItems = totalItems
    this.totalAmount = totalAmount
    this.note = note ?? ''
    this.status = status ?? OrderStatus.Waiting
    this.orderedAt = orderedAt ?? date
    this.confirmedAt = confirmedAt ?? null
    this.shippedAt = shippedAt ?? null
    this.succeededAt = succeededAt ?? null
    this.canceledAt = canceledAt ?? null
    this.ratedAt = ratedAt ?? null
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
