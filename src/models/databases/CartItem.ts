import { ObjectId } from 'mongodb'

type CartItemConstructor = {
  _id?: ObjectId
  userId: ObjectId
  productId: ObjectId
  unitPrice: number
  unitPriceAfterDiscount: number
  quantity: number
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
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    productId,
    unitPrice,
    unitPriceAfterDiscount,
    quantity,
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
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
