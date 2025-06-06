import 'express'

import Product from '~/models/databases/Product'
import User from '~/models/databases/User'
import { TokenPayload } from '~/models/requests/users.requests'

declare module 'express' {
  interface Request {
    decodedAuthorization?: TokenPayload
    decodedRefreshToken?: TokenPayload
    decodedVerifyEmailToken?: TokenPayload
    decodedForgotPasswordToken?: TokenPayload
    user?: User
    product?: Product
  }
}
