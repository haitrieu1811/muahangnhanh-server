import { ObjectId } from 'mongodb'

import { CartItemStatus } from '~/constants/enum'

type CartItemConstructor = {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  unitPrice: number
  unitPriceAfterDiscount: number
  quantity: number
  status?: CartItemStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class CartItem {
  _id: ObjectId
  userId: ObjectId
  productId: ObjectId
  unitPrice: number
  unitPriceAfterDiscount: number
  quantity: number
  status: CartItemStatus
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    productId,
    unitPrice,
    unitPriceAfterDiscount,
    quantity,
    status,
    createdAt,
    updatedAt
  }: CartItemConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.productId = productId
    this.unitPrice = unitPrice
    this.unitPriceAfterDiscount = unitPriceAfterDiscount
    this.quantity = quantity
    this.status = status ?? CartItemStatus.InCart
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
