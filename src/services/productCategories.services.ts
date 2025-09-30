import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import ProductCategory from '~/models/databases/ProductCategory'
import { CreateProductCategoryReqBody } from '~/models/requests/productCategories.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class ProductCategoriesService {
  async create(body: CreateProductCategoryReqBody, userId: ObjectId) {
    const { insertedId } = await databaseService.productCategories.insertOne(
      new ProductCategory({
        ...body,
        thumbnail: new ObjectId(body.thumbnail),
        userId
      })
    )
    const productCategory = await databaseService.productCategories.findOne({
      _id: insertedId
    })
    return {
      productCategory
    }
  }

  async update(body: CreateProductCategoryReqBody, productCategoryId: ObjectId) {
    const updatedProductCategory = await databaseService.productCategories.findOneAndUpdate(
      {
        _id: productCategoryId
      },
      {
        $set: {
          ...body,
          thumbnail: new ObjectId(body.thumbnail)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      productCategory: updatedProductCategory
    }
  }

  async delete(productCategoryId: ObjectId) {
    await databaseService.productCategories.deleteOne({
      _id: productCategoryId
    })
    return true
  }

  async read({ name, ...query }: PaginationReqQuery & { name?: string }) {
    const { page, limit, skip } = configurePagination(query)
    const text = name
      ? {
          $text: { $search: name }
        }
      : {}
    const match = { ...text }
    const [productCategories, totalProductCategories] = await Promise.all([
      databaseService.productCategories
        .aggregate<ProductCategory>([
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
            $unwind: {
              path: '$thumbnail'
            }
          },
          {
            $lookup: {
              from: 'products',
              localField: '_id',
              foreignField: 'categoryId',
              as: 'products'
            }
          },
          {
            $addFields: {
              thumbnail: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$thumbnail.name']
              },
              thumbnailId: '$thumbnail._id',
              totalProducts: {
                $size: '$products'
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              name: {
                $first: '$name'
              },
              description: {
                $first: '$description'
              },
              thumbnail: {
                $first: '$thumbnail'
              },
              thumbnailId: {
                $first: '$thumbnailId'
              },
              status: {
                $first: '$status'
              },
              totalProducts: {
                $first: '$totalProducts'
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
            $sort: {
              updatedAt: -1,
              name: -1
            }
          },
          {
            $skip: skip
          },
          {
            $limit: limit
          },
          {
            $project: {
              userId: 0
            }
          }
        ])
        .toArray(),
      databaseService.productCategories.countDocuments(match)
    ])
    return {
      productCategories,
      pagination: {
        page,
        limit,
        totalRows: totalProductCategories,
        totalPages: Math.ceil(totalProductCategories / limit)
      }
    }
  }

  async readDetail(productCategoryId: ObjectId) {
    const productCategories = await databaseService.productCategories
      .aggregate([
        {
          $match: {
            _id: productCategoryId
          }
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
          $unwind: {
            path: '$thumbnail'
          }
        },
        {
          $addFields: {
            thumbnail: {
              $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$thumbnail.name']
            },
            thumbnailId: '$thumbnail._id'
          }
        },
        {
          $group: {
            _id: '$_id',
            name: {
              $first: '$name'
            },
            description: {
              $first: '$description'
            },
            thumbnail: {
              $first: '$thumbnail'
            },
            thumbnailId: {
              $first: '$thumbnailId'
            },
            status: {
              $first: '$status'
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
            userId: 0
          }
        }
      ])
      .toArray()
    const productCategory = productCategories[0]
    productCategory.status = String(productCategory.status)
    return {
      productCategory
    }
  }
}

const productCategoriesService = new ProductCategoriesService()
export default productCategoriesService
