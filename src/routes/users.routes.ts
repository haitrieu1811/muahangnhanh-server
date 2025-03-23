import { Router } from 'express'

import { loginController, registerController, verifyEmailController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator, verifyEmailTokenValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Đăng ký
usersRouter.post('/register', registerValidator, registerController)

// Xác minh email
usersRouter.post('/verify-email', verifyEmailTokenValidator, verifyEmailController)

// Đăng nhập
usersRouter.post('/login', loginValidator, loginController)

export default usersRouter
