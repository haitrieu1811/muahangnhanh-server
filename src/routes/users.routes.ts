import { Router } from 'express'

import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateMeController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateMeValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Đăng ký
usersRouter.post('/register', registerValidator, registerController)

// Xác minh email
usersRouter.post('/verify-email', verifyEmailTokenValidator, verifyEmailController)

// Đăng nhập
usersRouter.post('/login', loginValidator, loginController)

// Đăng xuất
usersRouter.post('/logout', refreshTokenValidator, logoutController)

// Refresh token
usersRouter.post('/refresh-token', refreshTokenValidator, refreshTokenController)

// Lấy profile tài khoản đăng nhập
usersRouter.get('/me', accessTokenValidator, getMeController)

// Cập nhật tài khoản đăng nhập
usersRouter.put('/me', accessTokenValidator, updateMeValidator, updateMeController)

// Đổi mật khẩu
usersRouter.post('/change-password', accessTokenValidator, changePasswordValidator, changePasswordController)

// Quên mật khẩu
usersRouter.post('/forgot-password', forgotPasswordValidator, forgotPasswordController)

export default usersRouter
