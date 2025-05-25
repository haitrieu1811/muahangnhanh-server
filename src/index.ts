import express from 'express'
import cors, { CorsOptions } from 'cors'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import brandsRouter from '~/routes/brands.routes'
import mediasRouter from '~/routes/medias.routes'
import productCategoriesRouter from '~/routes/productCategories.routes'
import staticRouter from '~/routes/static.routes'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { initFolders } from '~/utils/file'
import productsRouter from '~/routes/products.routes'

databaseService.connect()

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
app.use('/brands', brandsRouter)
app.use('/products', productsRouter)
app.use(defaultErrorHandler as any)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
