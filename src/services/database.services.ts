import { Db, MongoClient } from 'mongodb'

const uri =
  'mongodb+srv://haitrieu1811:qfyOcU0YdpT2ewyV@muahangnhanh-cluster.g5ae1.mongodb.net/?retryWrites=true&w=majority&appName=muahangnhanh-cluster'

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
}

const databaseService = new DatabaseService()
export default databaseService
