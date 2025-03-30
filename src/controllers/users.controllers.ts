import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { USERS_MESSAGES } from '~/constants/message'
import User from '~/models/databases/User'
import {
  ChangePasswordReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  TokenPayload,
  UpdateMeReqBody,
  UpdateUserReqBody,
  UserIdReqParams
} from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
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

// Đăng xuất
export const logoutController = async (req: Request<ParamsDictionary, any, RefreshTokenReqBody>, res: Response) => {
  await usersService.logout(req.body.refreshToken)
  res.json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

// Refresh token
export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const result = await usersService.refreshToken({
    refreshToken: req.body.refreshToken,
    decodedRefreshToken: req.decodedRefreshToken as TokenPayload & { exp: number }
  })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    data: result
  })
}

// Lấy tài khoản tài khoản đăng nhập
export const getMeController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await usersService.getMe(new ObjectId(userId))
  res.json({
    message: USERS_MESSAGES.GET_PROFILE_ME_SUCCESS,
    data: result
  })
}

// Cập nhật thông tin tài khoản tài khoản đăng nhập
export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateMeReqBody>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await usersService.updateMe(new ObjectId(userId), req.body)
  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    data: result
  })
}

// Đổi mật khẩu
export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await usersService.changePassword(new ObjectId(userId), req.body.password)
  res.json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS,
    data: result
  })
}

// Quên mật khẩu
export const forgotPasswordController = async (req: Request, res: Response) => {
  await usersService.forgotPassword(req.user as User)
  res.json({
    message: USERS_MESSAGES.RESET_PASSWORD_REQUEST_SUCCESS
  })
}

// Đặt lại mật khẩu
export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { userId } = req.decodedForgotPasswordToken as TokenPayload
  const result = await usersService.resetPassword(new ObjectId(userId), req.body.password)
  res.json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    data: result
  })
}

// Lấy danh sách tất cả người dùng có trên hệ thống
export const getAllUsersController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const result = await usersService.getAllUsers(req.query)
  res.json({
    message: USERS_MESSAGES.GET_ALL_USERS_SUCCESS,
    data: result
  })
}

// Cập nhật người dùng trên hệ thống
export const updateUserController = async (req: Request<UserIdReqParams, any, UpdateUserReqBody>, res: Response) => {
  const result = await usersService.updateUser(new ObjectId(req.params.userId), req.body)
  res.json({
    message: USERS_MESSAGES.UPDATE_USER_SUCCESS,
    data: result
  })
}
