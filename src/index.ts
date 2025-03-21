import express from 'express'

import { ENV_CONFIG } from '~/constants/config'
import { defaultErrorHandler } from '~/middlewares/error.middlewares'
import usersRouter from '~/routes/users.routes'
import databaseService from '~/services/database.services'

databaseService.connect()

const app = express()
const port = ENV_CONFIG.PORT || 4000

app.use(express.json())
app.use('/users', usersRouter)
app.use(defaultErrorHandler as any)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
