import { CorsOptions } from 'cors'
import { Server as ServerHttp } from 'http'
import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'

import Notification from '~/models/databases/Notification'
import { TokenPayload } from '~/models/requests/users.requests'
import { NotificationPayloadData } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { verifyAccessToken } from '~/utils/helpers'

const initSocket = ({ httpServer, corsOptions }: { httpServer: ServerHttp; corsOptions: CorsOptions }) => {
  const io = new Server(httpServer, {
    cors: corsOptions
  })

  const users: {
    [key: string]: {
      socketId: string
    }
  } = {}

  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth
    const accessToken = (Authorization as string)?.split('Bearer ')[1]
    try {
      const decodedAuthorization = await verifyAccessToken(accessToken)
      socket.handshake.auth.decodedAuthorization = decodedAuthorization
      next()
    } catch (error) {
      next({
        name: 'Unauthorized',
        message: 'Không nhận được access token.',
        data: error
      })
    }
  })

  io.on('connection', (socket) => {
    console.log(`Người dùng ${socket.id} đã kết nối.`)
    const { decodedAuthorization } = socket.handshake.auth
    const { userId } = decodedAuthorization as TokenPayload
    users[userId] = {
      socketId: socket.id
    }
    console.log(users)

    socket.on('send_notification', async (payload: { to: string; data: NotificationPayloadData }) => {
      const receiverSocketId = users[payload.to]?.socketId
      const { insertedId } = await databaseService.notifications.insertOne(
        new Notification({ ...payload.data, userId: new ObjectId(payload.data.userId) })
      )
      const notification = await databaseService.notifications.findOne({ _id: insertedId })
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit('receive_notification', {
          data: notification,
          from: userId
        })
      }
    })

    socket.on('disconnect', () => {
      console.log(`Người dùng ${socket.id} đã ngắt kết nối.`)
      delete users[userId]
      console.log(users)
    })
  })
}

export default initSocket
