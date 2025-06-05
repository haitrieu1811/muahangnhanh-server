import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { ADDRESS_MESSAGES } from '~/constants/message'
import { DistrictIdReqParams, ProvinceIdReqParams } from '~/models/requests/addresses.requests'
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
