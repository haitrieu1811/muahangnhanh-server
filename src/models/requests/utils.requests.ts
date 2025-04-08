import { ParamsDictionary, Query } from 'express-serve-static-core'

export type PaginationReqQuery = Query & {
  page?: string
  limit?: string
}

export type ServeImageRequestParams = ParamsDictionary & {
  name: string
}
