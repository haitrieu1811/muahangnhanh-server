import { Collection, Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Address, { Province } from '~/models/databases/Address'
import Brand from '~/models/databases/Brand'
import CartItem from '~/models/databases/CartItem'
import Media from '~/models/databases/Media'
import Order from '~/models/databases/Order'
import Product, { ProductVariant } from '~/models/databases/Product'
import ProductCategory from '~/models/databases/ProductCategory'
import { RefreshToken } from '~/models/databases/RefreshToken'
import User from '~/models/databases/User'

const uri = `mongodb+srv://${ENV_CONFIG.DB_USERNAME}:${ENV_CONFIG.DB_PASSWORD}@muahangnhanh-cluster.g5ae1.mongodb.net/?retryWrites=true&w=majority&appName=muahangnhanh-cluster`

class DatabaseService {
  private client: MongoClient
  private db: Db

  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db('muahangnhanhDB')
  }

  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  async indexProductCategories() {
    const isExists = await this.productCategories.indexExists(['name_text'])
    if (!isExists) {
      await this.productCategories.createIndex({ name: 'text' })
    }
  }

  async indexProducts() {
    const isExists = await this.products.indexExists(['name_text'])
    if (!isExists) {
      await this.products.createIndex({ name: 'text' })
    }
  }

  get users(): Collection<User> {
    return this.db.collection(ENV_CONFIG.DB_USERS_COLLECTION)
  }

  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(ENV_CONFIG.DB_REFRESH_TOKENS_COLLECTION)
  }

  get medias(): Collection<Media> {
    return this.db.collection(ENV_CONFIG.DB_MEDIAS_COLLECTION)
  }

  get productCategories(): Collection<ProductCategory> {
    return this.db.collection(ENV_CONFIG.DB_PRODUCT_CATEGORIES_COLLECTION)
  }

  get brands(): Collection<Brand> {
    return this.db.collection(ENV_CONFIG.DB_BRANDS_COLLECTION)
  }

  get productVariants(): Collection<ProductVariant> {
    return this.db.collection(ENV_CONFIG.DB_PRODUCT_VARIANTS_COLLECTION)
  }

  get products(): Collection<Product> {
    return this.db.collection(ENV_CONFIG.DB_PRODUCTS_COLLECTION)
  }

  get addresses(): Collection<Address> {
    return this.db.collection(ENV_CONFIG.DB_ADDRESSES_COLLECTION)
  }

  get provinces(): Collection<Province> {
    return this.db.collection(ENV_CONFIG.DB_PROVINCES_COLLECTION)
  }

  get cartItems(): Collection<CartItem> {
    return this.db.collection(ENV_CONFIG.DB_CART_ITEMS_COLLECTION)
  }

  get orders(): Collection<Order> {
    return this.db.collection(ENV_CONFIG.DB_ORDERS_COLLECTION)
  }
}

const databaseService = new DatabaseService()
export default databaseService
