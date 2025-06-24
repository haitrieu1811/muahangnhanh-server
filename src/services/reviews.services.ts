import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Review from '~/models/databases/Review'
import { CreateReviewReqBody } from '~/models/requests/reviews.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

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

  // Lấy danh sách đánh giá của một sản phẩm
  async getReviewsByProductId({ productId, query }: { productId: ObjectId; query: PaginationReqQuery }) {
    const { skip, limit, page } = configurePagination(query)
    const match = {
      productId: new ObjectId(productId)
    }
    const [reviews, totalReviews, statistics] = await Promise.all([
      databaseService.reviews
        .aggregate([
          {
            $match: match
          },
          {
            $lookup: {
              from: 'users',
              localField: 'userId',
              foreignField: '_id',
              as: 'author'
            }
          },
          {
            $unwind: {
              path: '$author'
            }
          },
          {
            $lookup: {
              from: 'medias',
              localField: 'author.avatar',
              foreignField: '_id',
              as: 'authorAvatar'
            }
          },
          {
            $unwind: {
              path: '$authorAvatar',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'medias',
              localField: 'photos',
              foreignField: '_id',
              as: 'photos'
            }
          },
          {
            $unwind: {
              path: '$photos',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              'author.avatar': {
                $cond: [
                  '$authorAvatar',
                  {
                    $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$authorAvatar.name']
                  },
                  ''
                ]
              },
              photos: {
                $cond: [
                  '$photos',
                  {
                    $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$photos.name']
                  },
                  []
                ]
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              starPoints: {
                $first: '$starPoints'
              },
              photos: {
                $push: '$photos'
              },
              content: {
                $first: '$content'
              },
              author: {
                $first: '$author'
              },
              createdAt: {
                $first: '$createdAt'
              },
              updatedAt: {
                $first: '$updatedAt'
              }
            }
          },
          {
            $project: {
              'author.password': 0,
              'author.status': 0,
              'author.verifyStatus': 0,
              'author.role': 0,
              'author.verifyEmailToken': 0,
              'author.forgotPasswordToken': 0,
              'author.addresses': 0
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ])
        .toArray(),
      databaseService.reviews.countDocuments(match),
      databaseService.reviews.find(match).toArray()
    ])
    const starPoints = statistics.reduce((acc, item) => (acc += item.starPoints), 0) / totalReviews
    const totalOneStar = statistics.reduce((acc, item) => {
      if (item.starPoints === 1) return (acc += 1)
      return acc
    }, 0)
    const totalTwoStar = statistics.reduce((acc, item) => {
      if (item.starPoints === 2) return (acc += 1)
      return acc
    }, 0)
    const totalThreeStar = statistics.reduce((acc, item) => {
      if (item.starPoints === 3) return (acc += 1)
      return acc
    }, 0)
    const totalFourStar = statistics.reduce((acc, item) => {
      if (item.starPoints === 4) return (acc += 1)
      return acc
    }, 0)
    const totalFiveStar = statistics.reduce((acc, item) => {
      if (item.starPoints === 5) return (acc += 1)
      return acc
    }, 0)
    return {
      reviews,
      statistics: {
        starPoints,
        totalOneStar,
        totalTwoStar,
        totalThreeStar,
        totalFourStar,
        totalFiveStar
      },
      pagination: {
        page,
        limit,
        totalRows: totalReviews,
        totalPages: Math.ceil(totalReviews / limit)
      }
    }
  }
}

const reviewsService = new ReviewsService()
export default reviewsService
