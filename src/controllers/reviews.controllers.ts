import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'

import { REVIEWS_MESSAGE } from '~/constants/message'
import { ProductIdReqParams } from '~/models/requests/products.requests'
import { CreateReviewReqBody } from '~/models/requests/reviews.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import reviewsService from '~/services/reviews.services'

export const createReviewController = async (
  req: Request<ProductIdReqParams, any, CreateReviewReqBody>,
  res: Response
) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await reviewsService.createReview({
    body: req.body,
    productId: new ObjectId(req.params.productId),
    userId: new ObjectId(userId)
  })
  res.json({
    message: REVIEWS_MESSAGE.CREATE_REVIEW_SUCCESS,
    data: result
  })
}

export const getReviewdProductIdsController = async (req: Request, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await reviewsService.getReviewdProductIds(new ObjectId(userId))
  res.json({
    message: REVIEWS_MESSAGE.GET_REVIEWD_PRODUCT_IDS_SUCCESS,
    data: result
  })
}

export const getReviewsByProductIdController = async (
  req: Request<ProductIdReqParams, any, any, PaginationReqQuery>,
  res: Response
) => {
  const result = await reviewsService.getReviewsByProductId({
    productId: new ObjectId(req.params.productId),
    query: req.query
  })
  res.json({
    message: REVIEWS_MESSAGE.GET_REVIEWS_SUCCESS,
    data: result
  })
}
