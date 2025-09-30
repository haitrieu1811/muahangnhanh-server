import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Product, { AggregateProduct } from '~/models/databases/Product'
import { CreateProductReqBody, GetProductsReqQuery } from '~/models/requests/products.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class ProductsService {
  async aggregateProduct({
    match = {},
    matchAfterAggregate = {},
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    orderBy = 'desc'
  }: {
    match?: object
    matchAfterAggregate?: object
    limit?: number
    skip?: number
    sortBy?: string
    orderBy?: 'asc' | 'desc'
  }) {
    const aggregate = [
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
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'productId',
          as: 'reviews'
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
          },
          starPoints: {
            $cond: [
              {
                $size: '$reviews'
              },
              {
                $divide: [
                  {
                    $reduce: {
                      input: '$reviews',
                      initialValue: 0,
                      in: {
                        $add: ['$$value', '$$this.starPoints']
                      }
                    }
                  },
                  {
                    $size: '$reviews'
                  }
                ]
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
          starPoints: {
            $first: '$starPoints'
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
          status: {
            $first: '$status'
          },
          isFlashSale: {
            $first: '$isFlashSale'
          },
          isActive: {
            $first: '$isActive'
          },
          categoryId: {
            $first: '$categoryId'
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
        $match: matchAfterAggregate
      },
      {
        $project: {
          'author.password': 0,
          'author.verifyStatus': 0,
          'author.status': 0,
          'author.role': 0,
          'author.verifyEmailToken': 0,
          'author.forgotPasswordToken': 0,
          'author.addresses': 0,
          'thumbnail.userId': 0,
          'thumbnail.name': 0,
          'thumbnail.type': 0,
          'thumbnail.createdAt': 0,
          'thumbnail.updatedAt': 0
        }
      }
    ]
    const [products, totalProducts] = await Promise.all([
      databaseService.products
        .aggregate<AggregateProduct>([
          ...aggregate,
          {
            $sort: {
              [sortBy]: orderBy === 'desc' ? -1 : 1
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
      databaseService.products
        .aggregate([
          ...aggregate,
          {
            $count: 'total'
          }
        ])
        .toArray()
    ])
    return {
      products,
      totalProducts: totalProducts[0]?.total || 0
    }
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
    const { products } = await this.aggregateProduct({
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
    await databaseService.products.updateOne(
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
      }
    )
    const { products } = await this.aggregateProduct({
      match: {
        _id: productId
      }
    })
    const updatedProduct = products[0]
    return {
      product: updatedProduct
    }
  }

  // Lấy danh sách sản phẩm
  async getProducts(query: GetProductsReqQuery) {
    // Tìm kiếm theo tên
    const text = query.name
      ? {
          $text: {
            $search: query.name
          }
        }
      : {}
    // Lọc ID danh mục sản phẩm
    const configuredCategoryIds = query.categoryIds?.split('-')
    const _configuredCategoryIds = configuredCategoryIds?.map((categoryId) => new ObjectId(categoryId))
    // Bộ lọc tìm kiếm
    const match = omitBy(
      {
        ...text,
        isFlashSale: query.isFlashSale,
        isActive: query.isActive,
        priceAfterDiscount:
          query.minPrice || query.maxPrice
            ? omitBy(
                {
                  $gte: query.minPrice,
                  $lte: query.maxPrice
                },
                isUndefined
              )
            : undefined,
        categoryId: _configuredCategoryIds
          ? {
              $in: _configuredCategoryIds
            }
          : undefined
      },
      isUndefined
    )
    // Lọc theo sao
    const matchAfterAggregate = omitBy(
      {
        starPoints: query.minStarPoints
          ? {
              $gte: Number(query.minStarPoints)
            }
          : undefined
      },
      isUndefined
    )
    const { page, limit, skip } = configurePagination(query)
    const [{ products, totalProducts: totalRows }] = await Promise.all([
      this.aggregateProduct({
        match,
        limit,
        skip,
        sortBy: query.sortBy,
        orderBy: query.orderBy,
        matchAfterAggregate
      })
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
    const { products } = await this.aggregateProduct({
      match: {
        _id: productId
      }
    })
    return {
      product: products[0]
    }
  }

  /**
   * Xóa một sản phẩm
   */
  async deleteProduct(productId: ObjectId) {
    await databaseService.products.deleteOne({
      _id: productId
    })
    return true
  }
}

const productsService = new ProductsService()
export default productsService
