import { ObjectId } from 'mongodb'

import ProductCategory from '~/models/databases/ProductCategory'
import { CreateProductCategoryReqBody } from '~/models/requests/productCategories.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class ProductCategoriesService {
  async create(body: CreateProductCategoryReqBody, userId: ObjectId) {
    const { name, thumbnail, description } = body
    const { insertedId } = await databaseService.productCategories.insertOne(
      new ProductCategory({
        name,
        description,
        thumbnail: new ObjectId(thumbnail),
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

  async read(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [productCategories, totalProductCategories] = await Promise.all([
      databaseService.productCategories
        .find(
          {},
          {
            skip,
            limit
          }
        )
        .toArray(),
      databaseService.productCategories.countDocuments({})
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
}

const productCategoriesService = new ProductCategoriesService()
export default productCategoriesService
