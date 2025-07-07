import { ParamsDictionary } from 'express-serve-static-core'

import { BlogStatus } from '~/constants/enum'

export type CreateBlogReqBody = {
  title: string
  thumbnail: string
  content: string
  status?: BlogStatus
  order?: number
}

export type BlogIdReqParams = ParamsDictionary & {
  blogId: string
}

export type DeleteBlogsReqBody = {
  blogIds: string[]
}
