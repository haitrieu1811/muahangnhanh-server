import { ObjectId } from 'mongodb'
import { ENV_CONFIG } from '~/constants/config'

import { CartItemStatus, OrderStatus } from '~/constants/enum'
import Order from '~/models/databases/Order'
import { CreateOrderReqBody, GetOrdersReqQuery, UpdateOrderReqBody } from '~/models/requests/orders.requests'
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
          from: 'addresses',
          localField: 'addressId',
          foreignField: '_id',
          as: 'address'
        }
      },
      {
        $unwind: {
          path: '$address',
          preserveNullAndEmptyArrays: true
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
          path: '$province',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'communes',
          localField: 'address.communeId',
          foreignField: '_id',
          as: 'commune'
        }
      },
      {
        $unwind: {
          path: '$commune',
          preserveNullAndEmptyArrays: true
        }
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
          path: '$items',
          preserveNullAndEmptyArrays: true
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
          path: '$product',
          preserveNullAndEmptyArrays: true
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
          path: '$productThumbnail',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'address.province': '$province',
          'address.commune': '$commune',
          'product.thumbnail': {
            $cond: [
              '$productThumbnail',
              {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$productThumbnail.name']
              },
              null
            ]
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
          address: {
            $first: '$address'
          },
          items: {
            $push: '$items'
          },
          code: {
            $first: '$code'
          },
          shippingMethod: {
            $first: '$shippingMethod'
          },
          shippingFee: {
            $first: '$shippingFee'
          },
          totalItems: {
            $first: '$totalItems'
          },
          totalAmount: {
            $first: '$totalAmount'
          },
          totalDiscount: {
            $first: '$totalDiscount'
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
          canceledAt: {
            $first: '$canceledAt'
          },
          succeededAt: {
            $first: '$succeededAt'
          },
          ratedAt: {
            $first: '$ratedAt'
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
          'address.userId': 0,
          'address.provinceId': 0,
          'address.communeId': 0,
          'address.commune.provinceId': 0,
          'items.userId': 0,
          'items.productId': 0,
          'items.product.photos': 0,
          'items.product.description': 0,
          'items.product.userId': 0,
          'items.product.variants': 0,
          'items.product.status': 0,
          'items.product.approvalStatus': 0
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

  async getOrders({ match = {}, query }: { match?: object; query: GetOrdersReqQuery }) {
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
