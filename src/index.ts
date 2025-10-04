import cors, { CorsOptions } from 'cors'
import express from 'express'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
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

databaseService.connect().then(() => {
  databaseService.indexProductCategories()
  databaseService.indexProducts()
})

initFolders()

const app = express()
const port = ENV_CONFIG.PORT || 4000
const corsOptions: CorsOptions = {
  origin: '*'
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
