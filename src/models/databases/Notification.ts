import { ObjectId } from 'mongodb'

type NotificationConstructor = {
  _id?: ObjectId
  userId: ObjectId
  content: string
  url: string
  isRead?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export default class Notification {
  _id: ObjectId
  userId: ObjectId
  content: string
  url: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date

  constructor({ _id, userId, content, url, isRead, createdAt, updatedAt }: NotificationConstructor) {
    const date = new Date()
    this._id = _id ?? new ObjectId()
    this.userId = userId
    this.content = content
    this.url = url
    this.isRead = isRead ?? false
    this.createdAt = createdAt ?? date
    this.updatedAt = updatedAt ?? date
  }
}
