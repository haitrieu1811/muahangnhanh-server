import 'express'

import Address from '~/models/databases/Address'
import Blog from '~/models/databases/Blog'
import CartItem from '~/models/databases/CartItem'
import Order from '~/models/databases/Order'
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
    address?: Address
    cartItem?: CartItem
    cartItems?: CartItem[]
    order?: Order
    blog?: Blog
  }
}
