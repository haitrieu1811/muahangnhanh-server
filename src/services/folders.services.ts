import { ObjectId } from 'mongodb'

import Folder from '~/models/databases/Folder'
import { CreateFolderReqBody, UpdateFolderReqBody } from '~/models/requests/folders.requests'
import databaseService from '~/services/database.services'

class FoldersService {
  async inserOne({ userId, body }: { userId: ObjectId; body: CreateFolderReqBody }) {
    const { insertedId } = await databaseService.folders.insertOne(
      new Folder({
        ...body,
        userId,
        parentId: new ObjectId(body.parentId)
      })
    )
    const folder = await databaseService.folders.findOne({
      _id: insertedId
    })
    return {
      folder
    }
  }

  async updateOne({ body, folderId }: { body: UpdateFolderReqBody; folderId: ObjectId }) {
    const folder = await databaseService.folders.findOneAndUpdate(
      {
        _id: folderId
      },
      {
        $set: body,
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      folder
    }
  }

  async findMany(userId: ObjectId) {
    const match = { userId }
    const [folders, totalFolders] = await Promise.all([
      databaseService.folders.find(match).toArray(),
      databaseService.folders.countDocuments(match)
    ])
    return {
      totalFolders,
      folders
    }
  }
}

const foldersService = new FoldersService()
export default foldersService
