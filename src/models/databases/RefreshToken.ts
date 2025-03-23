import { ObjectId } from 'mongodb'

type RefreshTokenConstructor = {
  _id?: ObjectId
  userId: ObjectId
  token: string
  iat: number
  exp: number
  createdAt?: Date
  updatedAt?: Date
}

export class RefreshToken {
  _id: ObjectId
  userId: ObjectId
  token: string
  iat: Date
  exp: Date
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, token, iat, exp, createdAt, updatedAt }: RefreshTokenConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.token = token
    this.iat = new Date(iat * 1000)
    this.exp = new Date(exp * 1000)
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
