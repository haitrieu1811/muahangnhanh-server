import { ObjectId } from 'mongodb'
import { ENV_CONFIG } from '~/constants/config'

import { CartItemStatus } from '~/constants/enum'
import Order from '~/models/databases/Order'
import { CreateOrderReqBody } from '~/models/requests/orders.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class OrdersService {
  async createOrder({ userId, body }: { userId: ObjectId; body: CreateOrderReqBody }) {
    const itemIds = body.items.map((item) => new ObjectId(item))
    const { insertedId } = await databaseService.orders.insertOne(
      new Order({
        ...body,
        userId,
        items: itemIds
      })
    )
    const [order] = await Promise.all([
      databaseService.orders.findOne({
        _id: insertedId
      }),
      databaseService.cartItems.updateMany(
        {
          _id: {
            $in: itemIds
          }
        },
        {
          $set: {
            status: CartItemStatus.Waiting
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
    ])
    return {
      order
    }
  }

  aggregateOrder({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    return [
      {
        $match: match
      },
      {
        $lookup: {
          from: 'cartItems',
          localField: 'items',
          foreignField: '_id',
          as: 'items'
        }
      },
      {
        $unwind: {
          path: '$items'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: {
          path: '$product'
        }
      },
      {
        $lookup: {
          from: 'medias',
          localField: 'product.thumbnail',
          foreignField: '_id',
          as: 'productThumbnail'
        }
      },
      {
        $unwind: {
          path: '$productThumbnail'
        }
      },
      {
        $lookup: {
          from: 'productCategories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'productCategory'
        }
      },
      {
        $unwind: {
          path: '$productCategory',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'product.thumbnail': {
            _id: '$productThumbnail._id',
            url: {
              $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$productThumbnail.name']
            }
          },
          'product.category': {
            _id: '$productCategory._id',
            name: '$productCategory.name',
            createdAt: '$productCategory.createdAt',
            updatedAt: '$productCategory.updatedAt'
          }
        }
      },
      {
        $addFields: {
          'items.product': '$product'
        }
      },
      {
        $group: {
          _id: '$_id',
          items: {
            $push: '$items'
          },
          totalItems: {
            $first: '$totalItems'
          },
          totalAmount: {
            $first: '$totalAmount'
          },
          note: {
            $first: '$note'
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
          'items.userId': 0,
          'items.productId': 0,
          'items.product.photos': 0,
          'items.product.categoryId': 0,
          'items.product.description': 0,
          'items.product.userId': 0
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
    ]
  }

  async getOrders({ userId, query }: { userId: ObjectId; query: PaginationReqQuery }) {
    const match = {
      userId
    }
    const { page, limit, skip } = configurePagination(query)
    const [orders, totalOrders] = await Promise.all([
      databaseService.orders.aggregate(this.aggregateOrder({ match, skip, limit })).toArray(),
      databaseService.orders.countDocuments(match)
    ])
    return {
      orders,
      page,
      limit,
      totalRows: totalOrders,
      totalPages: Math.ceil(totalOrders / limit)
    }
  }

  async getOrder(orderId: ObjectId) {
    const orders = await databaseService.orders
      .aggregate(
        this.aggregateOrder({
          match: {
            _id: orderId
          }
        })
      )
      .toArray()
    return {
      order: orders[0]
    }
  }
}

const ordersService = new OrdersService()
export default ordersService
