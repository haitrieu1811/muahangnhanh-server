import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Product from '~/models/databases/Product'
import { CreateProductReqBody } from '~/models/requests/products.requests'
import databaseService from '~/services/database.services'

class ProductsService {
  async aggregateProduct(match?: object) {
    const products = await databaseService.products
      .aggregate([
        {
          $match: match || {}
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'thumbnail',
            foreignField: '_id',
            as: 'thumbnail'
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
          $lookup: {
            from: 'productCategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category'
          }
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
            path: '$thumbnail'
          }
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'category.thumbnail',
            foreignField: '_id',
            as: 'categoryThumbnail'
          }
        },
        {
          $unwind: {
            path: '$categoryThumbnail',
            preserveNullAndEmptyArrays: true
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
          $unwind: {
            path: '$photos',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            thumbnailId: '$thumbnail._id',
            thumbnail: '$thumbnail.name',
            category: {
              $cond: [
                '$category',
                {
                  _id: '$category._id',
                  thumbnail: {
                    $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$categoryThumbnail.name']
                  },
                  name: '$category.name',
                  description: '$category.description',
                  createdAt: '$category.createdAt',
                  updatedAt: '$category.updatedAt'
                },
                null
              ]
            },
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
                  _id: '$photos._id',
                  url: {
                    $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$photos.name']
                  }
                },
                null
              ]
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            thumbnail: {
              $first: '$thumbnail'
            },
            photos: {
              $push: '$photos'
            },
            name: {
              $first: '$name'
            },
            description: {
              $first: '$description'
            },
            category: {
              $first: '$category'
            },
            author: {
              $first: '$author'
            },
            price: {
              $first: '$price'
            },
            priceAfterDiscount: {
              $first: '$priceAfterDiscount'
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
          $addFields: {
            photos: {
              $cond: [
                {
                  $first: '$photos'
                },
                '$photos',
                []
              ]
            }
          }
        },
        {
          $project: {
            'author.password': 0,
            'author.verifyStatus': 0,
            'author.status': 0,
            'author.role': 0,
            'author.verifyEmailToken': 0,
            'author.forgotPasswordToken': 0
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: 0
        },
        {
          $limit: 20
        }
      ])
      .toArray()
    return products
  }

  // Tạo sản phẩm mới
  async createProduct({ body, userId }: { body: CreateProductReqBody; userId: ObjectId }) {
    const { insertedId } = await databaseService.products.insertOne(
      new Product({
        ...body,
        thumbnail: new ObjectId(body.thumbnail),
        photos: body.photos?.map((photo) => new ObjectId(photo)),
        userId,
        categoryId: new ObjectId(body.categoryId)
      })
    )
    const products = await this.aggregateProduct({
      _id: insertedId
    })
    return {
      product: products[0]
    }
  }
}

const productsService = new ProductsService()
export default productsService
