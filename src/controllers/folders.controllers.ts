import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { CreateFolderReqBody, FolderIdReqParams, UpdateFolderReqBody } from '~/models/requests/folders.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import foldersService from '~/services/folders.services'

export const createFolderController = async (
  req: Request<ParamsDictionary, any, CreateFolderReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const data = await foldersService.inserOne({
    userId: new ObjectId(userId),
    body: req.body
  })
  res.json({
    message: 'Tạo thư mục thành công.',
    data
  })
}

export const updateFolderController = async (
  req: Request<FolderIdReqParams, any, UpdateFolderReqBody>,
  res: Response
) => {
  const data = await foldersService.updateOne({
    folderId: new ObjectId(req.params.folderId),
    body: req.body
  })
  res.json({
    message: 'Cập nhật thư mục thành công.',
    data
  })
}
