import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { ParamsDictionary } from 'express-serve-static-core'

import { MEDIAS_MESSAGES } from '~/constants/message'
import { TokenPayload } from '~/models/requests/users.requests'
import { ImageIdReqParams, PaginationReqQuery, ServeImageRequestParams } from '~/models/requests/utils.requests'
import mediasService from '~/services/medias.services'
import { sendFileFromS3 } from '~/utils/s3'

// Tải ảnh lên
export const uploadImagesController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await mediasService.uploadImages(req, new ObjectId(userId))
  res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCEED,
    data: result
  })
}

// Lấy ảnh từ AWS S3
export const serveImageController = async (req: Request<ServeImageRequestParams>, res: Response) => {
  const { name } = req.params
  sendFileFromS3(res, `images/${name}`)
}

// Lấy dánh sách hình ảnh tài khoản đăng nhập tải lên
export const getImagesController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const { images, ...pagination } = await mediasService.getImages({
    userId: new ObjectId(userId),
    query: req.query
  })
  res.json({
    message: MEDIAS_MESSAGES.GET_IMAGES_SUCCESS,
    data: {
      images,
      pagination
    }
  })
}

// Xóa hình ảnh
export const deleteImageController = async (req: Request<ImageIdReqParams>, res: Response) => {
  await mediasService.deleteImage(new ObjectId(req.params.imageId))
  res.json({
    message: MEDIAS_MESSAGES.DELETE_IMAGE_SUCCESS
  })
}
