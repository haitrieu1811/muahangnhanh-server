import { ObjectId } from 'mongodb'

import Review from '~/models/databases/Review'
import { CreateReviewReqBody } from '~/models/requests/reviews.requests'
import databaseService from '~/services/database.services'

class ReviewsService {
  async createReview({
    body,
    productId,
    userId
  }: {
    body: CreateReviewReqBody
    userId: ObjectId
    productId: ObjectId
  }) {
    const { insertedId } = await databaseService.reviews.insertOne(
      new Review({
        ...body,
        productId,
        userId,
        photos: body.photos?.map((photo) => new ObjectId(photo))
      })
    )
    const review = await databaseService.reviews.findOne({
      _id: insertedId
    })
    return {
      review
    }
  }

  // Lấy danh sách ID sản phẩm mà người dùng đã đánh giá rồi
  async getReviewdProductIds(userId: ObjectId) {
    const reviewdProducts = await databaseService.reviews
      .find({
        userId
      })
      .toArray()
    const reviewdProductIds = reviewdProducts.map((reviewdProduct) => reviewdProduct.productId)
    return {
      reviewdProductIds
    }
  }
}

const reviewsService = new ReviewsService()
export default reviewsService
