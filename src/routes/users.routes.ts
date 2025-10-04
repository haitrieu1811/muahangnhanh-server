import { Router } from 'express'

import {
  changePasswordController,
  deleteUserController,
  forgotPasswordController,
  getAllUsersController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resetPasswordController,
  updateMeController,
  updateUserController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  isActiveUserValidator,
  isAdminValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  updateUserValidator,
  userIdValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

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

// Đặt lại mật khẩu
usersRouter.post('/reset-password', forgotPasswordTokenValidator, resetPasswordValidator, resetPasswordController)

// Lấy danh sách tất cả người dùng có trên hệ thống
usersRouter.get(
  '/all',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  paginationValidator,
  getAllUsersController
)

// Cập nhật người dùng trên hệ thống
usersRouter.patch(
  '/:userId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  userIdValidator,
  updateUserValidator,
  updateUserController
)

// Xóa người dùng trên hệ thống
usersRouter.delete(
  '/:userId',
  accessTokenValidator,
  isActiveUserValidator,
  isAdminValidator,
  userIdValidator,
  deleteUserController
)

export default usersRouter
