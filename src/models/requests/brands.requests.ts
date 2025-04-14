import { ParamsDictionary } from 'express-serve-static-core'

export type CreateBrandReqBody = {
  name: string
  thumbnail: string
  description?: string
}

export type BrandIdReqParams = ParamsDictionary & {
  brandId: string
}
