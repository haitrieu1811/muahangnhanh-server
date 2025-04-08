import { ObjectId } from 'mongodb'

import { MediaType } from '~/constants/enum'

export type MediaUploadRes = {
  _id: ObjectId
  name: string
  type: MediaType
}
