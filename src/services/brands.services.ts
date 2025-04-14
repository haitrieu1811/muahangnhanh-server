import { ObjectId } from 'mongodb'

import Brand from '~/models/databases/Brand'
import { CreateBrandReqBody } from '~/models/requests/brands.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class BrandsService {
  async create(body: CreateBrandReqBody, userId: ObjectId) {
    const { name, thumbnail, description } = body
    const { insertedId } = await databaseService.brands.insertOne(
      new Brand({
        name,
        description,
        thumbnail: new ObjectId(thumbnail),
        userId
      })
    )
    const brand = await databaseService.brands.findOne({
      _id: insertedId
    })
    return {
      brand
    }
  }

  async update(body: CreateBrandReqBody, brandId: ObjectId) {
    const updatedBrand = await databaseService.brands.findOneAndUpdate(
      {
        _id: brandId
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
      brand: updatedBrand
    }
  }

  async delete(brandId: ObjectId) {
    await databaseService.brands.deleteOne({
      _id: brandId
    })
    return true
  }

  async read(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [brands, totalBrands] = await Promise.all([
      databaseService.brands
        .find(
          {},
          {
            skip,
            limit
          }
        )
        .toArray(),
      databaseService.brands.countDocuments({})
    ])
    return {
      brands,
      pagination: {
        page,
        limit,
        totalRows: totalBrands,
        totalPages: Math.ceil(totalBrands / limit)
      }
    }
  }
}

const brandsService = new BrandsService()
export default brandsService
