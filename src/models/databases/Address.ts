import { ObjectId } from 'mongodb'

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
  fullName: string
  phoneNumber: string
  provinceId: ObjectId
  districtId: string
  wardId: string
  createdAt?: Date
  updatedAt?: Date
}

export default class Address {}
