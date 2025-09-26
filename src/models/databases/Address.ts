import { ObjectId } from 'mongodb'

import { AddressType } from '~/constants/enum'

export type Commune = {
  _id: ObjectId
  provinceId: ObjectId
  name: string
  prefix: string
  createdAt: Date
  updatedAt: Date
}

export type Province = {
  _id: ObjectId
  name: string
  prefix: string
  createdAt: Date
  updatedAt: Date
}

type AddressConstructor = {
  _id?: ObjectId
  userId: ObjectId
  fullName: string
  phoneNumber: string
  provinceId: ObjectId
  communeId: ObjectId
  detail: string
  type: AddressType
  isDefault?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export default class Address {
  _id: ObjectId
  userId: ObjectId
  fullName: string
  phoneNumber: string
  provinceId: ObjectId
  communeId: ObjectId
  detail: string
  type: AddressType
  isDefault: boolean
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    userId,
    fullName,
    phoneNumber,
    provinceId,
    communeId,
    detail,
    type,
    isDefault,
    createdAt,
    updatedAt
  }: AddressConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.fullName = fullName
    this.phoneNumber = phoneNumber
    this.provinceId = provinceId
    this.communeId = communeId
    this.detail = detail
    this.type = type
    this.isDefault = isDefault ?? false
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
