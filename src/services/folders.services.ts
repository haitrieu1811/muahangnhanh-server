import { ObjectId } from 'mongodb'
import Folder from '~/models/databases/Folder'
import databaseService from '~/services/database.services'

class FoldersService {
  async inserOne(input: { name: string; parentId?: ObjectId; userId: ObjectId }) {
    const { insertedId } = await databaseService.folders.insertOne(new Folder(input))
    const folder = await databaseService.folders.findOne({
      _id: insertedId
    })
    return {
      folder
    }
  }
}

const foldersService = new FoldersService()
export default foldersService
