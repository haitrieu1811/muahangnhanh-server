import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId, WithId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { TokenType, UserStatus, UserVerifyStatus } from '~/constants/enum'
import { RefreshToken } from '~/models/databases/RefreshToken'
import User from '~/models/databases/User'
import { RegisterReqBody, TokenPayload, UpdateMeReqBody, UpdateUserReqBody } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import mediasService from '~/services/medias.services'
import { hashPassword } from '~/utils/crypto'
import { sendForgotPasswordEmail, sendVerifyEmail } from '~/utils/email'
import { signToken, verifyToken } from '~/utils/jwt'

class UsersService {
  // Tạo access token
  async signAccessToken(payload: TokenPayload) {
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.AccessToken
      },
      privateKey: ENV_CONFIG.JWT_SECRET_ACCESS_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.ACCESS_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo refresh token
  async signRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          ...payload,
          tokenType: TokenType.RefreshToken,
          exp
        },
        privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
      })
    }
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.RefreshToken
      },
      privateKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.REFRESH_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo access và refresh token
  async signAccessAndRefreshToken({ exp, ...payload }: TokenPayload & { exp?: number }) {
    return Promise.all([this.signAccessToken(payload), this.signRefreshToken({ exp, ...payload })])
  }

  // Tạo token xác thực email
  async signVerifyEmailToken(payload: TokenPayload) {
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.VerifyEmailToken
      },
      privateKey: ENV_CONFIG.JWT_SECRET_VERIFY_EMAIL_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.VERIFY_EMAIL_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Tạo token đặt lại mật khẩu
  async signForgotPasswordToken(payload: TokenPayload) {
    return signToken({
      payload: {
        ...payload,
        tokenType: TokenType.ForgotPasswordToken
      },
      privateKey: ENV_CONFIG.JWT_SECRET_FORGOT_PASSWORD_TOKEN,
      options: {
        expiresIn: ENV_CONFIG.FORGOT_PASSWORD_TOKEN_EXPIRES_IN as any
      }
    })
  }

  // Giải mã refresh token
  async decodedRefreshToken(refreshToken: string) {
    const tokenPayload = await verifyToken({
      token: refreshToken,
      secretOrPublicKey: ENV_CONFIG.JWT_SECRET_REFRESH_TOKEN
    })
    return tokenPayload
  }

  // Đăng ký tài khoản
  async register(body: RegisterReqBody) {
    const userId = new ObjectId()
    const verifyEmailToken = await this.signVerifyEmailToken({
      userId: userId.toString(),
      userVerifyStatus: UserVerifyStatus.Unverified,
      userStatus: UserStatus.Active,
      userRole: body.role
    })
    const [, [accessToken, refreshToken]] = await Promise.all([
      await databaseService.users.insertOne(
        new User({
          ...body,
          _id: userId,
          password: hashPassword(body.password),
          verifyEmailToken
        })
      ),
      usersService.signAccessAndRefreshToken({
        userId: userId.toString(),
        userRole: body.role,
        userStatus: UserStatus.Active,
        userVerifyStatus: UserVerifyStatus.Unverified
      }),
      sendVerifyEmail(body.email, verifyEmailToken)
    ])
    const decodedRefreshToken = await this.decodedRefreshToken(refreshToken)
    const [user] = await Promise.all([
      databaseService.users.findOne(userId, {
        projection: {
          email: 1,
          fullName: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }),
      databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: refreshToken,
          iat: decodedRefreshToken.iat,
          exp: decodedRefreshToken.exp,
          userId
        })
      )
    ])
    return {
      accessToken,
      refreshToken,
      user
    }
  }

  // Xác minh email
  async verifyEmail(userId: ObjectId) {
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: {
          verifyStatus: UserVerifyStatus.Verified,
          verifyEmailToken: ''
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          email: 1,
          fullName: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )
    return { user }
  }

  // Đăng nhập
  async login(user: User) {
    const { _id, role, status, verifyStatus } = user
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: _id.toString(),
      userRole: role,
      userStatus: status,
      userVerifyStatus: verifyStatus
    })
    const decodedRefreshToken = await this.decodedRefreshToken(refreshToken)
    const [_user] = await Promise.all([
      this.aggregateUser(_id),
      // Lưu phiên đăng nhập vào database
      databaseService.refreshTokens.insertOne(
        new RefreshToken({
          token: refreshToken,
          iat: decodedRefreshToken.iat,
          exp: decodedRefreshToken.exp,
          userId: _id
        })
      )
    ])
    return {
      accessToken,
      refreshToken,
      user: _user
    }
  }

  // Đăng xuất
  async logout(refreshToken: string) {
    await databaseService.refreshTokens.deleteOne({ token: refreshToken })
    return true
  }

  // Refresh token
  async refreshToken({
    refreshToken,
    decodedRefreshToken
  }: {
    refreshToken: string
    decodedRefreshToken: TokenPayload & { exp: number }
  }) {
    const { userId, userRole, userStatus, userVerifyStatus, exp } = decodedRefreshToken
    // Tạo tokens mới
    const [newAcessToken, newRefreshToken] = await this.signAccessAndRefreshToken({
      userId,
      userRole,
      userStatus,
      userVerifyStatus,
      exp
    })
    // Giải mã refresh token mới
    const decodedNewRefreshToken = await this.decodedRefreshToken(newRefreshToken)
    await Promise.all([
      // Thêm refresh token mới vào DB
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({
          userId: new ObjectId(decodedNewRefreshToken.userId),
          token: newRefreshToken,
          iat: decodedNewRefreshToken.iat,
          exp: decodedNewRefreshToken.exp
        })
      ),
      // Xóa refresh token cũ
      await databaseService.refreshTokens.deleteOne({
        token: refreshToken
      })
    ])
    return {
      accessToken: newAcessToken,
      refreshToken: newRefreshToken
    }
  }

  async aggregateUser(userId: ObjectId) {
    const users = await databaseService.users
      .aggregate<User>([
        {
          $match: {
            _id: userId
          }
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'avatar',
            foreignField: '_id',
            as: 'avatar'
          }
        },
        {
          $unwind: {
            path: '$avatar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            avatar: {
              $cond: [
                '$avatar',
                {
                  $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$avatar.name']
                },
                ''
              ]
            },
            avatarId: {
              $cond: ['$avatar', '$avatar._id', null]
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            email: {
              $first: '$email'
            },
            fullName: {
              $first: '$fullName'
            },
            avatar: {
              $first: '$avatar'
            },
            avatarId: {
              $first: '$avatarId'
            },
            status: {
              $first: '$status'
            },
            verifyStatus: {
              $first: '$verifyStatus'
            },
            createdAt: {
              $first: '$createdAt'
            },
            updatedAt: {
              $first: '$updatedAt'
            }
          }
        }
      ])
      .toArray()
    return users[0]
  }

  async getMe(userId: ObjectId) {
    const user = await this.aggregateUser(userId)
    return {
      user
    }
  }

  async updateMe(userId: ObjectId, body: UpdateMeReqBody) {
    const configuredBody = omitBy(
      {
        ...body,
        avatar: body.avatar !== undefined ? (body.avatar !== null ? new ObjectId(body.avatar) : null) : undefined
      },
      isUndefined
    )
    const beforeUser = await databaseService.users.findOne({
      _id: userId
    })
    const updatedUser = await databaseService.users.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: configuredBody,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    // Xóa ảnh không sử dụng
    if (
      (beforeUser?.avatar && updatedUser?.avatar && beforeUser.avatar.toString() !== updatedUser.avatar.toString()) ||
      (updatedUser?.avatar === null && beforeUser?.avatar)
    ) {
      await mediasService.deleteImage(beforeUser.avatar)
    }
    const user = await this.aggregateUser(userId)
    return {
      user
    }
  }

  async changePassword(userId: ObjectId, newPassword: string) {
    const updatedUser = await databaseService.users.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: {
          password: hashPassword(newPassword)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          email: 1,
          fullName: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )
    return {
      user: updatedUser as WithId<User>
    }
  }

  async forgotPassword({ _id, status, verifyStatus, role, email }: User) {
    // Tạo forgotPasswordToken
    const forgotPasswordToken = await this.signForgotPasswordToken({
      userId: _id.toString(),
      userRole: role,
      userStatus: status,
      userVerifyStatus: verifyStatus
    })
    // Gửi mail và cập nhật giá trị forgotPasswordToken trong DB
    await Promise.all([
      sendForgotPasswordEmail(email, forgotPasswordToken),
      databaseService.users.updateOne(
        {
          _id
        },
        {
          $set: {
            forgotPasswordToken
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
    ])
    return true
  }

  async resetPassword(userId: ObjectId, newPassword: string) {
    const [{ user }] = await Promise.all([
      this.changePassword(userId, newPassword),
      databaseService.users.updateOne(
        {
          _id: userId
        },
        {
          $set: {
            forgotPasswordToken: ''
          }
        }
      )
    ])
    const [accessToken, refreshToken] = await this.signAccessAndRefreshToken({
      userId: user._id.toString(),
      userRole: user.role,
      userStatus: user.status,
      userVerifyStatus: user.verifyStatus
    })
    const { exp, iat } = await this.decodedRefreshToken(refreshToken)
    // Đăng nhập lại sau khi đổi mật khẩu thành công
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        token: refreshToken,
        exp,
        iat,
        userId
      })
    )
    return {
      accessToken,
      refreshToken,
      user
    }
  }

  async getAllUsers({ page, limit }: PaginationReqQuery) {
    const _page = Number(page) || 1
    const _limit = Number(limit) || 10
    const totalUsers = await databaseService.users.countDocuments({})
    const skip = (_page - 1) * _limit
    const allUsers = await databaseService.users
      .find(
        {},
        {
          skip,
          limit: _limit,
          projection: {
            email: 1,
            fullName: 1,
            role: 1,
            createdAt: 1,
            updatedAt: 1
          }
        }
      )
      .toArray()
    return {
      users: allUsers.map((user) => ({
        ...user,
        role: user.role.toString()
      })),
      pagination: {
        page: _page,
        limit: _limit,
        totalRows: totalUsers,
        totalPages: Math.ceil(totalUsers / _limit)
      }
    }
  }

  async updateUser(userId: ObjectId, body: UpdateUserReqBody) {
    const configuredBody = omitBy(
      {
        status: body.status ? body.status : undefined
      },
      isUndefined
    )
    const updatedUser = await databaseService.users.findOneAndUpdate(
      {
        _id: userId
      },
      {
        $set: configuredBody,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          email: 1,
          fullName: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    )
    return {
      user: updatedUser
    }
  }

  async deleteUser(userId: ObjectId) {
    await databaseService.users.deleteOne({
      _id: userId
    })
    return true
  }
}

const usersService = new UsersService()
export default usersService
