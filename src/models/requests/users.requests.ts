import { ParamsDictionary } from 'express-serve-static-core'

import { UserRole, UserStatus, UserVerifyStatus } from '~/constants/enum'

export type TokenPayload = {
  userId: string
  userRole: UserRole
  userStatus: UserStatus
  userVerifyStatus: UserVerifyStatus
}

export type RegisterReqBody = {
  email: string
  password: string
  role: UserRole
}

export type VerifyEmailTokenReqBody = {
  verifyEmailToken: string
}

export type RefreshTokenReqBody = {
  refreshToken: string
}

export type UpdateMeReqBody = {
  fullName: string
  avatar?: string
}

export type ChangePasswordReqBody = {
  password: string
}

export type UpdateUserReqBody = {
  status?: UserStatus
}

export type UserIdReqParams = ParamsDictionary & {
  userId: string
}
