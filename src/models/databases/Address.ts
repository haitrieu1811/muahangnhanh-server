import { ObjectId } from 'mongodb'
import { AddressType } from '~/constants/enum'

type Ward = {
  id: string
  name: string
  prefix: string
}

type District = {
  id: string
  name: string
  wards: Ward[]
}

export type Province = {
  _id: ObjectId
  code: string
  name: string
  districts: District[]
}

type AddressConstructor = {
  _id?: ObjectId
  userId: ObjectId
  fullName: string
  phoneNumber: string
  provinceId: ObjectId
  districtId: string
  wardId: string
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
  districtId: string
  wardId: string
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
    districtId,
    wardId,
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
    this.districtId = districtId
    this.wardId = wardId
    this.detail = detail
    this.type = type
    this.isDefault = isDefault ?? false
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
