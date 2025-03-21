import { ObjectId } from 'mongodb'

import { UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum'
import { generateRandomString } from '~/utils/helpers'

type UserConstructor = {
  _id?: ObjectId
  email: string
  password: string
  fullName?: string
  avatar?: ObjectId
  verifyStatus?: UserVerifyStatus
  status?: UserStatus
  role?: UserRole
  verifyEmailToken?: string
  forgotPasswordToken?: string
  createdAt?: Date
  updatedAt?: Date
}

export default class User {
  _id: ObjectId
  email: string
  password: string
  fullName: string
  avatar: ObjectId | null
  verifyStatus: UserVerifyStatus
  status: UserStatus
  role: UserRole
  verifyEmailToken: string
  forgotPasswordToken: string
  createdAt: Date
  updatedAt: Date

  constructor({
    _id,
    email,
    password,
    fullName,
    avatar,
    verifyStatus,
    status,
    role,
    verifyEmailToken,
    forgotPasswordToken,
    createdAt,
    updatedAt
  }: UserConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.email = email
    this.password = password
    this.fullName = fullName ?? `Temp${generateRandomString(8)}`
    this.avatar = avatar ?? null
    this.verifyStatus = verifyStatus ?? UserVerifyStatus.Unverified
    this.status = status ?? UserStatus.Active
    this.role = role ?? UserRole.Customer
    this.verifyEmailToken = verifyEmailToken ?? ''
    this.forgotPasswordToken = forgotPasswordToken ?? ''
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
