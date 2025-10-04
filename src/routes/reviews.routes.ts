import { Router } from 'express'

import {
  createReviewController,
  getReviewdProductIdsController,
  getReviewsByProductIdController
} from '~/controllers/reviews.controllers'
import { productIdValidator } from '~/middlewares/products.middlewares'
import {
  createReviewValidator,
  isHasNotReviewdValidator,
  isPurchasedBeforeValidator
} from '~/middlewares/reviews.middlewares'
import { accessTokenValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const reviewsRouter = Router()

reviewsRouter.post(
  '/products/:productId',
  accessTokenValidator,
  productIdValidator,
  isPurchasedBeforeValidator, // Kiểm tra đã mua sản phẩm thành công để được đánh giá
  isHasNotReviewdValidator, // Kiểm tra xem đã đánh giá sản phẩm trước đó rồi hay chưa
  createReviewValidator,
  createReviewController
)

reviewsRouter.get('/product-ids', accessTokenValidator, getReviewdProductIdsController)

reviewsRouter.get('/products/:productId', productIdValidator, paginationValidator, getReviewsByProductIdController)

export default reviewsRouter
