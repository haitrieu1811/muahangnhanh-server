import { Router } from 'express'

import { registerController, verifyEmailController } from '~/controllers/users.controllers'
import { registerValidator, verifyEmailTokenValidator } from '~/middlewares/users.middlewares'

const usersRouter = Router()

// Đăng ký
usersRouter.post('/register', registerValidator, registerController)

// Xác minh email
usersRouter.post('/verify-email', verifyEmailTokenValidator, verifyEmailController)

export default usersRouter
