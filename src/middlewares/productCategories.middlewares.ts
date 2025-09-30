import { NextFunction, Request, Response } from 'express'
import { checkSchema, ParamSchema } from 'express-validator'
import { ObjectId } from 'mongodb'

import HTTP_STATUS from '~/constants/httpStatus'
import { PRODUCTS_MESSAGES } from '~/constants/message'
import { imageIdSchema } from '~/middlewares/utils.middlewares'
import { ErrorWithStatus } from '~/models/Error'
import { ProductCategoryIdReqParams } from '~/models/requests/productCategories.requests'
import databaseService from '~/services/database.services'
import { validate } from '~/utils/validation'

export const productCategoryIdSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string) => {
      if (!value) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_ID_IS_REQUIRED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_ID_IS_INVALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const productCategory = await databaseService.productCategories.findOne({
        _id: new ObjectId(value)
      })
      if (!productCategory) {
        throw new ErrorWithStatus({
          message: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_NOT_EXIST,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      return true
    }
  }
}

export const createProductCategoryValidator = validate(
  checkSchema(
    {
      name: {
        trim: true,
        notEmpty: {
          errorMessage: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_NAME_IS_REQUIRED
        }
      },
      description: {
        trim: true,
        optional: true
      },
      thumbnail: imageIdSchema
    },
    ['body']
  )
)

export const productCategoryIdValidator = validate(
  checkSchema(
    {
      productCategoryId: productCategoryIdSchema
    },
    ['params']
  )
)

export const isEmptyProductCategoryValidator = async (
  req: Request<ProductCategoryIdReqParams>,
  res: Response,
  next: NextFunction
) => {
  const totalProducts = await databaseService.products.countDocuments({
    categoryId: new ObjectId(req.params.productCategoryId)
  })
  if (totalProducts > 0) {
    next(
      new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: PRODUCTS_MESSAGES.PRODUCT_CATEGORY_MUST_BE_EMPTY
      })
    )
  }
  next()
}
