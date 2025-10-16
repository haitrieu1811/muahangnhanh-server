import cors, { CorsOptions } from 'cors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import { TokenPayload } from '~/models/requests/users.requests'
import addressesRouter from '~/routes/addresses.routes'
import blogsRouter from '~/routes/blogs.routes'
import cartItemsRouter from '~/routes/cartItems.routes'
import mediasRouter from '~/routes/medias.routes'
import metadataRouter from '~/routes/metadata.routes'
import ordersRouter from '~/routes/orders.routes'
import productCategoriesRouter from '~/routes/productCategories.routes'
import productsRouter from '~/routes/products.routes'
import provincesRouter from '~/routes/provinces.routes'
import reviewsRouter from '~/routes/reviews.routes'
import staticRouter from '~/routes/static.routes'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { initFolders } from '~/utils/file'
import { verifyAccessToken } from '~/utils/helpers'

databaseService.connect().then(() => {
  databaseService.indexProductCategories()
  databaseService.indexProducts()
})

initFolders()

const app = express()
const httpServer = createServer(app)
const port = ENV_CONFIG.PORT || 4000

const corsOptions: CorsOptions = {
  origin: ENV_CONFIG.CLIENT_HOST
}

app.use(cors(corsOptions))
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/product-categories', productCategoriesRouter)
app.use('/products', productsRouter)
app.use('/addresses', addressesRouter)
app.use('/provinces', provincesRouter)
app.use('/cart-items', cartItemsRouter)
app.use('/orders', ordersRouter)
app.use('/reviews', reviewsRouter)
app.use('/blogs', blogsRouter)
app.use('/metadata', metadataRouter)
app.use(defaultErrorHandler as any)

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

  socket.on('send_notification', (payload) => {
    const receiverSocketId = users[payload.to]?.socketId
    if (!receiverSocketId) return
    socket.to(receiverSocketId).emit('receive_notification', {
      message: payload.message,
      from: userId
    })
  })

  socket.on('disconnect', () => {
    console.log(`Người dùng ${socket.id} đã ngắt kết nối.`)
    delete users[userId]
    console.log(users)
  })
})

httpServer.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
