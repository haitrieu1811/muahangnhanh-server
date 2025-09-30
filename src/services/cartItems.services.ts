import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import { CartItemStatus } from '~/constants/enum'
import CartItem from '~/models/databases/CartItem'
import Product from '~/models/databases/Product'
import databaseService from '~/services/database.services'

class CartItemsService {
  async addProductToCart({ product, userId, quantity }: { product: Product; userId: ObjectId; quantity: number }) {
    const cartItem = await databaseService.cartItems.findOne({
      productId: product._id,
      userId,
      status: CartItemStatus.InCart
    })
    // Thêm mới nếu chưa người dùng chưa thêm sản phẩm này vào giỏ hàng
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
    }
    // Cập nhật số lượng nếu người dùng đã thêm sản phẩm này vào giỏ hàng
    else {
      await databaseService.cartItems.updateOne(
        {
          _id: cartItem._id
        },
        {
          $set: {
            unitPrice: product.price,
            unitPriceAfterDiscount: product.priceAfterDiscount
          },
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

  async getMyCart(userId: ObjectId) {
    const cartItems = await databaseService.cartItems
      .aggregate([
        {
          $match: {
            userId,
            status: CartItemStatus.InCart
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: 'productId',
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
            'product.thumbnail': {
              $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$thumbnail.name']
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            product: {
              $first: '$product'
            },
            unitPrice: {
              $first: '$unitPrice'
            },
            unitPriceAfterDiscount: {
              $first: '$unitPriceAfterDiscount'
            },
            quantity: {
              $first: '$quantity'
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
            'product.userId': 0,
            'product.photos': 0,
            'product.categoryId': 0,
            'product.description': 0,
            'product.status': 0
          }
        },
        {
          $sort: {
            createdAt: -1
          }
        }
      ])
      .toArray()
    const totalItems = cartItems.reduce((acc, item) => (acc += item.quantity), 0)
    const totalAmount = cartItems.reduce((acc, item) => (acc += item.quantity * item.unitPriceAfterDiscount), 0)
    return {
      totalItems,
      totalAmount,
      cartItems
    }
  }

  async updateCartItem({ cartItemId, quantity }: { cartItemId: ObjectId; quantity: number }) {
    await databaseService.cartItems.updateOne(
      {
        _id: cartItemId
      },
      {
        $set: {
          quantity
        },
        $currentDate: {
          updatedAt: true
        }
      }
    )
    return true
  }

  async deleteCartItems(cartItemIds: ObjectId[]) {
    await databaseService.cartItems.deleteMany({
      _id: {
        $in: cartItemIds
      }
    })
    return true
  }
}

const cartItemsService = new CartItemsService()
export default cartItemsService
