import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { USERS_MESSAGES } from '~/constants/message'
import User from '~/models/databases/User'
import { RegisterReqBody, TokenPayload } from '~/models/requests/users.requests'
import usersService from '~/services/users.services'

// Đăng ký
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await usersService.register(req.body)
  res.json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    data: result
  })
}

// Xác minh email
export const verifyEmailController = async (req: Request, res: Response) => {
  const { userId } = req.decodedVerifyEmailToken as TokenPayload
  const result = await usersService.verifyEmail(new ObjectId(userId))
  res.json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    data: result
  })
}

// Đăng nhập
export const loginController = async (req: Request, res: Response) => {
  const result = await usersService.login(req.user as User)
  res.json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    data: result
  })
}
