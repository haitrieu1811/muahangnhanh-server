import { ObjectId } from 'mongodb'
import { ENV_CONFIG } from '~/constants/config'

import { CartItemStatus, OrderStatus } from '~/constants/enum'
import Order from '~/models/databases/Order'
import { CreateOrderReqBody, UpdateOrderReqBody } from '~/models/requests/orders.requests'
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
        items: itemIds,
        addressId: new ObjectId(body.addressId)
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
        $lookup: {
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'address'
        }
      },
      {
        $unwind: {
          path: '$address'
        }
      },
      {
        $lookup: {
          from: 'provinces',
          localField: 'address.provinceId',
          foreignField: '_id',
          as: 'province'
        }
      },
      {
        $unwind: {
          path: '$province'
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
          },
          'address.province': '$province',
          district: {
            $filter: {
              input: '$province.districts',
              as: 'district',
              cond: {
                $eq: ['$$district.id', '$address.districtId']
              }
            }
          }
        }
      },
      {
        $unwind: {
          path: '$district'
        }
      },
      {
        $addFields: {
          'items.product': '$product',
          ward: {
            $filter: {
              input: '$district.wards',
              as: 'ward',
              cond: {
                $eq: ['$$ward.id', '$address.wardId']
              }
            }
          }
        }
      },
      {
        $unwind: {
          path: '$ward'
        }
      },
      {
        $addFields: {
          'address.district': '$district',
          'address.ward': '$ward'
        }
      },
      {
        $group: {
          _id: '$_id',
          code: {
            $first: '$code'
          },
          items: {
            $push: '$items'
          },
          address: {
            $first: '$address'
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
          orderedAt: {
            $first: '$orderedAt'
          },
          confirmedAt: {
            $first: '$confirmedAt'
          },
          shippedAt: {
            $first: '$shippedAt'
          },
          succeededAt: {
            $first: '$succeededAt'
          },
          canceledAt: {
            $first: '$canceledAt'
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
          'items.product.userId': 0,
          'items.product.variants': 0,
          'address.userId': 0,
          'address.provinceId': 0,
          'address.districtId': 0,
          'address.wardId': 0,
          'address.province.districts': 0,
          'address.province.id': 0,
          'address.district.wards': 0,
          'address.district.streets': 0,
          'address.district.projects': 0
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

  async updateOrder({ orderId, body }: { orderId: ObjectId; body: UpdateOrderReqBody }) {
    switch (body.status) {
      case OrderStatus.Confirmed:
        await databaseService.orders.updateOne(
          {
            _id: orderId
          },
          {
            $set: {
              status: body.status
            },
            $currentDate: {
              confirmedAt: true
            }
          }
        )
        break
      case OrderStatus.Delivering:
        await databaseService.orders.updateOne(
          {
            _id: orderId
          },
          {
            $set: {
              status: body.status
            },
            $currentDate: {
              shippedAt: true
            }
          }
        )
        break
      case OrderStatus.Success:
        await databaseService.orders.updateOne(
          {
            _id: orderId
          },
          {
            $set: {
              status: body.status
            },
            $currentDate: {
              succeededAt: true
            }
          }
        )
        break
      case OrderStatus.Cancel:
        await databaseService.orders.updateOne(
          {
            _id: orderId
          },
          {
            $set: {
              status: body.status
            },
            $currentDate: {
              canceledAt: true
            }
          }
        )
        break
      default:
        break
    }
    return true
  }
}

const ordersService = new OrdersService()
export default ordersService
