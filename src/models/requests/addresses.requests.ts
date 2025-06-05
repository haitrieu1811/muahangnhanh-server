import { ParamsDictionary } from 'express-serve-static-core'

export type ProvinceIdReqParams = ParamsDictionary & {
  provinceId: string
}

export type DistrictIdReqParams = ParamsDictionary & {
  districtId: string
}
