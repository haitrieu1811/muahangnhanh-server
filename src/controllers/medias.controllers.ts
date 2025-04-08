import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { MEDIAS_MESSAGES } from '~/constants/message'
import { TokenPayload } from '~/models/requests/users.requests'
import { ServeImageRequestParams } from '~/models/requests/utils.requests'
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
