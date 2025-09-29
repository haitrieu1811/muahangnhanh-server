import { ObjectId } from 'mongodb'

import { OrderStatus, ShippingMethod } from '~/constants/enum'
import { generateRandomString } from '~/utils/helpers'

type OrderConstructor = {
  _id?: ObjectId
  userId: ObjectId
  items: ObjectId[]
  addressId: ObjectId
  code?: string
  shippingMethod: ShippingMethod
  shippingFee: number
  totalItems: number
  totalAmount: number
  totalDiscount?: number
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
  code: string
  shippingMethod: ShippingMethod
  shippingFee: number
  totalItems: number
  totalAmount: number
  totalDiscount: number
  note: string
  status: OrderStatus
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    items,
    addressId,
    code,
    shippingMethod,
    shippingFee,
    totalItems,
    totalAmount,
    totalDiscount = 0,
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
    this.code = code ?? generateRandomString(14)
    this.shippingMethod = shippingMethod
    this.shippingFee = shippingFee
    this.totalItems = totalItems
    this.totalAmount = totalAmount
    this.totalDiscount = totalDiscount
    this.note = note ?? ''
    this.status = status ?? OrderStatus.Waiting
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
