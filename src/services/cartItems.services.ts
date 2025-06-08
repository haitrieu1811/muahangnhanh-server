import { ObjectId } from 'mongodb'

import CartItem from '~/models/databases/CartItem'
import Product from '~/models/databases/Product'
import databaseService from '~/services/database.services'

class CartItemsService {
  async addProductToCart({ product, userId, quantity }: { product: Product; userId: ObjectId; quantity: number }) {
    const cartItem = await databaseService.cartItems.findOne({
      productId: product._id,
      userId
    })
    if (!cartItem) {
      await databaseService.cartItems.insertOne(
        new CartItem({
          userId,
          quantity,
          productId: product._id,
          unitPrice: product.price,
          unitPriceAfterDiscount: product.priceAfterDiscount
        })
      )
    } else {
      await databaseService.cartItems.updateOne(
        {
          _id: cartItem._id
        },
        {
          $inc: {
            quantity
          },
          $currentDate: {
            updatedAt: true
          }
        }
      )
    }
    return true
  }
}

const cartItemsService = new CartItemsService()
export default cartItemsService
