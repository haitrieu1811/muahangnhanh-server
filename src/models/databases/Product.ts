import { ObjectId } from 'mongodb'

import { ProductStatus } from '~/constants/enum'

type ProductVariantConstructor = {
  _id?: ObjectId
  productId: ObjectId
  thumbnail: ObjectId
  name: string
  price: number
  priceAfterDiscount?: number
  availableCount: number
  createdAt?: Date
  updatedAt?: Date
}

export class ProductVariant {
  _id: ObjectId
  productId: ObjectId
  thumbnail: ObjectId
  name: string
  price: number
  priceAfterDiscount: number
  availableCount: number
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    productId,
    thumbnail,
    name,
    price,
    priceAfterDiscount,
    availableCount,
    createdAt,
    updatedAt
  }: ProductVariantConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.productId = productId
    this.thumbnail = thumbnail
    this.name = name
    this.price = price
    this.priceAfterDiscount = priceAfterDiscount ?? price
    this.availableCount = availableCount
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

type ProductConstructor = {
  _id?: ObjectId
  thumbnail: ObjectId
  photos?: ObjectId[]
  name: string
  categoryId?: ObjectId
  description: string
  userId: ObjectId
  price: number
  priceAfterDiscount?: number
  variants?: ObjectId[]
  status?: ProductStatus
  createdAt?: Date
  updatedAt?: Date
}

export default class Product {
  _id: ObjectId
  thumbnail: ObjectId
  photos: ObjectId[]
  name: string
  categoryId: ObjectId | null
  description: string
  userId: ObjectId
  price: number
  priceAfterDiscount: number
  variants: ObjectId[]
  status: ProductStatus
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    thumbnail,
    photos,
    name,
    categoryId,
    description,
    userId,
    price,
    priceAfterDiscount,
    variants,
    status,
    createdAt,
    updatedAt
  }: ProductConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.thumbnail = thumbnail
    this.photos = photos ?? []
    this.name = name
    this.categoryId = categoryId ?? null
    this.description = description
    this.userId = userId
    this.price = price
    this.priceAfterDiscount = priceAfterDiscount ?? price
    this.variants = variants ?? []
    this.status = status ?? ProductStatus.Active
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}

export type AggregateProduct = {
  _id: ObjectId
  thumbnail: {
    _id: ObjectId
    url: string
  }
  photos: {
    _id: ObjectId
    url: string
  }[]
  name: string
  description: string
  starPoints: 1 | 2 | 3 | 4 | 5
  category: {
    _id: ObjectId
    thumbnail: string
    name: string
    description: string
    createdAt: string
    updatedAt: string
  }
  author: {
    _id: ObjectId
    email: string
    fullName: string
    avatar: string
    createdAt: string
    updatedAt: string
  }
  price: number
  priceAfterDiscount: number
  createdAt: string
  updatedAt: string
}
