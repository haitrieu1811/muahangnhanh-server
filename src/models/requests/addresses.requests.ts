import { ParamsDictionary } from 'express-serve-static-core'

import { AddressType } from '~/constants/enum'

export type ProvinceIdReqParams = ParamsDictionary & {
  provinceId: string
}

export type CreateAddressReqBody = {
  fullName: string
  phoneNumber: string
  provinceId: string
  communeId: string
  detail: string
  type: AddressType
}

export type AddressIdReqParams = ParamsDictionary & {
  addressId: string
}
