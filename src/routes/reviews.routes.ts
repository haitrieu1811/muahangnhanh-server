import { Router } from 'express'

import { createReviewController, getReviewdProductIdsController } from '~/controllers/reviews.controllers'
import { productIdValidator } from '~/middlewares/products.middlewares'
import {
  createReviewValidator,
  isHasNotReviewdValidator,
  isPurchasedBeforeValidator
} from '~/middlewares/reviews.middlewares'
import { accessTokenValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'

const reviewsRouter = Router()

reviewsRouter.post(
  '/products/:productId',
  accessTokenValidator,
  isVerifiedUserValidator,
  productIdValidator,
  isPurchasedBeforeValidator, // Kiểm tra đã mua sản phẩm thành công để được đánh giá
  isHasNotReviewdValidator, // Kiểm tra xem đã đánh giá sản phẩm trước đó rồi hay chưa
  createReviewValidator,
  createReviewController
)

reviewsRouter.get('/product-ids', accessTokenValidator, isVerifiedUserValidator, getReviewdProductIdsController)

export default reviewsRouter
