import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { MEDIAS_MESSAGES } from '~/constants/message'
import { TokenPayload } from '~/models/requests/users.requests'
import mediasService from '~/services/medias.services'

export const uploadImagesController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await mediasService.uploadImages(req, new ObjectId(userId))
  res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCEED,
    data: result
  })
}
