import { ObjectId } from 'mongodb'

import { BlogStatus } from '~/constants/enum'

export type AggregateBlog = {
  _id: string
  thumbnail: {
    _id: string
    url: string
  }
  title: string
  author: {
    _id: string
    email: string
    fullName: string
    avatar: string
    createdAt: string
    updatedAt: string
  }
  content: string
  status: BlogStatus
  createdAt: string
  updatedAt: string
}

type BlogConstructor = {
  _id?: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  title: string
  content: string
  status?: BlogStatus
  order?: number
  createdAt?: Date
  updatedAt?: Date
}

export default class Blog {
  _id: ObjectId
  userId: ObjectId
  thumbnail: ObjectId
  title: string
  content: string
  status: BlogStatus
  order: number
  createdAt: Date
  updatedAt: Date

  constructor({ _id, thumbnail, userId, title, content, status, order, createdAt, updatedAt }: BlogConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.thumbnail = thumbnail
    this.userId = userId
    this.title = title
    this.content = content
    this.status = status ?? BlogStatus.Active
    this.order = order ?? 0
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
