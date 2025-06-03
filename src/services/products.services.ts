import isEmpty from 'lodash/isEmpty'
import xor from 'lodash/xor'
import difference from 'lodash/difference'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Product, { AggregateProduct } from '~/models/databases/Product'
import { CreateProductReqBody } from '~/models/requests/products.requests'
import databaseService from '~/services/database.services'
import mediasService from '~/services/medias.services'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import { configurePagination } from '~/utils/helpers'
import { ProductApprovalStatus, ProductStatus } from '~/constants/enum'

class ProductsService {
  async aggregateProduct({
    match = {},
    limit = 20,
    skip = 0
  }: {
    match?: object
    page?: number
    limit?: number
    skip?: number
  }) {
    const products = await databaseService.products
      .aggregate<AggregateProduct>([
        {
          $match: match
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
            thumbnail: {
              _id: '$thumbnail._id',
              url: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$thumbnail.name']
              }
            },
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
            'author.forgotPasswordToken': 0,
            'thumbnail.userId': 0,
            'thumbnail.name': 0,
            'thumbnail.type': 0,
            'thumbnail.createdAt': 0,
            'thumbnail.updatedAt': 0
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
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
      match: {
        _id: insertedId
      }
    })
    return {
      product: products[0]
    }
  }

  // Cập nhật sản phẩm
  async updateProduct({ body, productId }: { body: CreateProductReqBody; productId: ObjectId }) {
    const beforeProduct = await databaseService.products.findOneAndUpdate(
      {
        _id: productId
      },
      {
        $set: {
          ...body,
          thumbnail: new ObjectId(body.thumbnail),
          photos: body.photos?.map((photo) => new ObjectId(photo)),
          categoryId: new ObjectId(body.categoryId)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'before'
      }
    )
    const products = await this.aggregateProduct({
      match: {
        _id: productId
      }
    })
    const updatedProduct = products[0]
    if (
      beforeProduct &&
      updatedProduct &&
      updatedProduct.thumbnail._id.toString() !== beforeProduct.thumbnail.toString()
    ) {
      await mediasService.deleteImage(beforeProduct._id)
    }
    // Kiểm tra hai mảng photos có giống nhau hay không
    // Nếu không giống nhau thì tiến hành xóa các hình ảnh không còn sử dụng nữa
    if (
      beforeProduct &&
      updatedProduct &&
      !isEmpty(
        xor(
          beforeProduct.photos,
          updatedProduct.photos.map((photo) => photo._id)
        )
      )
    ) {
      const photosToDelete = difference(
        beforeProduct.photos,
        updatedProduct.photos.map((photo) => photo._id)
      )
      await Promise.all(photosToDelete.map(async (photo) => await mediasService.deleteImage(photo)))
    }
    return {
      product: updatedProduct
    }
  }

  // Lấy danh sách sản phẩm
  async getProducts(query: PaginationReqQuery) {
    const match = {
      status: ProductStatus.Active,
      approvalStatus: ProductApprovalStatus.Resolved
    }
    const { page, limit, skip } = configurePagination(query)
    const [products, totalRows] = await Promise.all([
      this.aggregateProduct({
        limit,
        skip,
        match
      }),
      databaseService.products.countDocuments(match)
    ])
    const totalPages = Math.ceil(totalRows / limit)
    return {
      products,
      page,
      limit,
      totalRows,
      totalPages
    }
  }

  // Lấy chi tiết sản phẩm
  async getProduct(productId: ObjectId) {
    const products = await this.aggregateProduct({
      match: {
        _id: productId,
        status: ProductStatus.Active,
        approvalStatus: ProductApprovalStatus.Resolved
      }
    })
    return {
      product: products[0]
    }
  }
}

const productsService = new ProductsService()
export default productsService
