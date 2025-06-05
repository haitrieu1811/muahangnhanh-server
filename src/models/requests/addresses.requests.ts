import { ParamsDictionary } from 'express-serve-static-core'

import { AddressType } from '~/constants/enum'

export type ProvinceIdReqParams = ParamsDictionary & {
  provinceId: string
}

export type DistrictIdReqParams = ParamsDictionary & {
  districtId: string
}

export type CreateAddressReqBody = {
  fullName: string
  phoneNumber: string
  provinceId: string
  districtId: string
  wardId: string
  detail: string
  type: AddressType
}
