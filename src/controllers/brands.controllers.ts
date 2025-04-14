import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { PRODUCTS_MESSAGES } from '~/constants/message'
import { BrandIdReqParams, CreateBrandReqBody } from '~/models/requests/brands.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import brandsService from '~/services/brands.services'

// Tạo nhãn hiệu sản phẩm
export const createBrandController = async (req: Request<ParamsDictionary, any, CreateBrandReqBody>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await brandsService.create(req.body, new ObjectId(userId))
  res.json({
    message: PRODUCTS_MESSAGES.CREATE_BRAND_SUCCESS,
    data: result
  })
}

// Cập nhật nhãn hiệu sản phẩm
export const updateBrandController = async (req: Request<BrandIdReqParams, any, CreateBrandReqBody>, res: Response) => {
  const { brandId } = req.params
  const result = await brandsService.update(req.body, new ObjectId(brandId))
  res.json({
    message: PRODUCTS_MESSAGES.UPDATE_BRAND_SUCCESS,
    data: result
  })
}

// Xóa nhãn hiệu sản phẩm
export const deleteBrandController = async (req: Request<BrandIdReqParams>, res: Response) => {
  const { brandId } = req.params
  await brandsService.delete(new ObjectId(brandId))
  res.json({
    message: PRODUCTS_MESSAGES.DELETE_BRAND_SUCCESS
  })
}

// Lấy danh sách nhãn hiệu sản phẩm
export const getBrandsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const result = await brandsService.read(req.query)
  res.json({
    message: PRODUCTS_MESSAGES.GET_BRANDS_SUCCESS,
    data: result
  })
}
