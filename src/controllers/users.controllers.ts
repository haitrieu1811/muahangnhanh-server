import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'

import { USERS_MESSAGES } from '~/constants/message'
import { RegisterReqBody } from '~/models/requests/users.requests'
import usersService from '~/services/users.services'

// Đăng ký
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}
