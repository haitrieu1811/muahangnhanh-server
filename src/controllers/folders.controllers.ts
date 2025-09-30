import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { TokenPayload } from '~/models/requests/users.requests'
import foldersService from '~/services/folders.services'

export const createFolderController = async (
  req: Request<
    ParamsDictionary,
    any,
    {
      name: string
      parentId?: string
    }
  >,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const data = await foldersService.inserOne({
    name: req.body.name,
    parentId: req.body.parentId ? new ObjectId(req.body.parentId) : undefined,
    userId: new ObjectId(userId)
  })
  res.json({
    message: 'Tạo thư mục thành công.',
    data
  })
}
