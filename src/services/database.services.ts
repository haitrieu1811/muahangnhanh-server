import { Collection, Db, MongoClient } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Brand from '~/models/databases/Brand'
import Media from '~/models/databases/Media'
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
}

const databaseService = new DatabaseService()
export default databaseService
