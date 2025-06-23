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
}

const reviewsService = new ReviewsService()
export default reviewsService
