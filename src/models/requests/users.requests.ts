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
