import { ObjectId } from 'mongodb'

import { CartItemStatus } from '~/constants/enum'
import Order from '~/models/databases/Order'
import { CreateOrderReqBody } from '~/models/requests/orders.requests'
import databaseService from '~/services/database.services'

class OrdersService {
  async createOrder({ buyerId, body }: { buyerId: ObjectId; body: CreateOrderReqBody }) {
    const itemIds = body.items.map((item) => new ObjectId(item))
    const { insertedId } = await databaseService.orders.insertOne(
      new Order({
        ...body,
        sellerId: new ObjectId(body.sellerId),
        items: itemIds,
        buyerId
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
}

const ordersService = new OrdersService()
export default ordersService
