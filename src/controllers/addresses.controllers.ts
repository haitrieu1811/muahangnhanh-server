import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { ADDRESS_MESSAGES } from '~/constants/message'
import {
  AddressIdReqParams,
  CreateAddressReqBody,
  DistrictIdReqParams,
  ProvinceIdReqParams
} from '~/models/requests/addresses.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import addressesService from '~/services/addresses.services'

export const getProvincesController = async (req: Request, res: Response) => {
  const result = await addressesService.getProvinces()
  res.json({
    message: ADDRESS_MESSAGES.GET_PROVINCES_SUCCESS,
    data: result
  })
}

export const getDistrictsController = async (req: Request<ProvinceIdReqParams>, res: Response) => {
  const result = await addressesService.getDistricts(new ObjectId(req.params.provinceId))
  res.json({
    message: ADDRESS_MESSAGES.GET_DISTRICTS_SUCCESS,
    data: result
  })
}

export const getWardsController = async (req: Request<ProvinceIdReqParams & DistrictIdReqParams>, res: Response) => {
  const result = await addressesService.getWards({
    provinceId: new ObjectId(req.params.provinceId),
    districtId: req.params.districtId
  })
  res.json({
    message: ADDRESS_MESSAGES.GET_WARDS_SUCCESS,
    data: result
  })
}

export const createAddressController = async (
  req: Request<ParamsDictionary, any, CreateAddressReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await addressesService.createAddress({
    body: req.body,
    userId: new ObjectId(userId)
  })
  res.json({
    message: ADDRESS_MESSAGES.CREATE_ADDRESS_SUCCESS,
    data: result
  })
}

export const getMyAddressesController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await addressesService.getAddresses(new ObjectId(userId))
  res.json({
    message: ADDRESS_MESSAGES.GET_MY_ADDRESSES_SUCCESS,
    data: result
  })
}

export const getAddressController = async (req: Request<AddressIdReqParams>, res: Response) => {
  const result = await addressesService.getAddress(new ObjectId(req.params.addressId))
  res.json({
    message: ADDRESS_MESSAGES.GET_ADDRESS_SUCCESS,
    data: result
  })
}

export const updateAddressController = async (
  req: Request<AddressIdReqParams, any, CreateAddressReqBody>,
  res: Response
) => {
  const result = await addressesService.updateAddress({
    body: req.body,
    addressId: new ObjectId(req.params.addressId)
  })
  res.json({
    message: ADDRESS_MESSAGES.UPDATE_ADDRESS_SUCCESS,
    data: result
  })
}

export const deleteAddressController = async (req: Request<AddressIdReqParams>, res: Response) => {
  await addressesService.deleteAddress(new ObjectId(req.params.addressId))
  res.json({
    message: ADDRESS_MESSAGES.DELETE_ADDRESS_SUCCESS
  })
}
