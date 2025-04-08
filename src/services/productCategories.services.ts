import { ObjectId } from 'mongodb'

import ProductCategory from '~/models/databases/ProductCategory'
import { CreateProductCategoryReqBody } from '~/models/requests/productCategories.requests'
import databaseService from '~/services/database.services'

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
}

const productCategoriesService = new ProductCategoriesService()
export default productCategoriesService
