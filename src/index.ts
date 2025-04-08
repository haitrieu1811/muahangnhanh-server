import express from 'express'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import mediasRouter from '~/routes/medias.routes'
import productCategoriesRouter from '~/routes/productCategories.routes'
import staticRouter from '~/routes/static.routes'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'
import { initFolders } from '~/utils/file'

databaseService.connect()

initFolders()

const app = express()
const port = ENV_CONFIG.PORT || 4000

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/static', staticRouter)
app.use('/product-categories', productCategoriesRouter)
app.use(defaultErrorHandler as any)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
