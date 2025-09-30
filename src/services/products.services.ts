import isUndefined from 'lodash/isUndefined'
import omitBy from 'lodash/omitBy'
import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { ProductStatus } from '~/constants/enum'
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
    const { products } = await this.aggregateProduct({
      match: {
        _id: productId
      }
    })
    const updatedProduct = products[0]
    // if (
    //   beforeProduct &&
    //   updatedProduct &&
    //   updatedProduct.thumbnail._id.toString() !== beforeProduct.thumbnail.toString()
    // ) {
    //   await mediasService.deleteImage(beforeProduct._id)
    // }
    // // Kiểm tra hai mảng photos có giống nhau hay không
    // // Nếu không giống nhau thì tiến hành xóa các hình ảnh không còn sử dụng nữa
    // if (
    //   beforeProduct &&
    //   updatedProduct &&
    //   !isEmpty(
    //     xor(
    //       beforeProduct.photos,
    //       updatedProduct.photos.map((photo) => photo._id)
    //     )
    //   )
    // ) {
    //   const photosToDelete = difference(
    //     beforeProduct.photos,
    //     updatedProduct.photos.map((photo) => photo._id)
    //   )
    //   await Promise.all(photosToDelete.map(async (photo) => await mediasService.deleteImage(photo)))
    // }
    return {
      product: updatedProduct
    }
  }

  // Lấy danh sách sản phẩm
  async getProducts({ name, sortBy, orderBy, categoryIds, minStarPoints, ...query }: GetProductsReqQuery) {
    // Tìm kiếm theo tên
    const text = name
      ? {
          $text: {
            $search: name
          }
        }
      : {}
    const configuredCategoryIds = categoryIds?.split('-')
    const _configuredCategoryIds = configuredCategoryIds?.map((categoryId) => new ObjectId(categoryId))
    const match = omitBy(
      {
        ...text,
        status: ProductStatus.Active,
        categoryId: _configuredCategoryIds
          ? {
              $in: _configuredCategoryIds
            }
          : undefined
      },
      isUndefined
    )
    const matchAfterAggregate = omitBy(
      {
        starPoints: minStarPoints
          ? {
              $gte: Number(minStarPoints)
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
        sortBy,
        orderBy,
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

  // Lấy danh sách sản phẩm
  async getAllProducts({ name, sortBy, orderBy, categoryIds, minStarPoints, ...query }: GetProductsReqQuery) {
    // Tìm kiếm theo tên
    const text = name
      ? {
          $text: {
            $search: name
          }
        }
      : {}
    const configuredCategoryIds = categoryIds?.split('-')
    const _configuredCategoryIds = configuredCategoryIds?.map((categoryId) => new ObjectId(categoryId))
    const match = omitBy(
      {
        ...text,
        categoryId: _configuredCategoryIds
          ? {
              $in: _configuredCategoryIds
            }
          : undefined
      },
      isUndefined
    )
    const matchAfterAggregate = omitBy(
      {
        starPoints: minStarPoints
          ? {
              $gte: Number(minStarPoints)
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
        sortBy,
        orderBy,
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
