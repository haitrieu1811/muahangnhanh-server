import { Request } from 'express'
import fsPromise from 'fs/promises'
import mime from 'mime'
import { ObjectId } from 'mongodb'
import path from 'path'
import sharp from 'sharp'

import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import Media from '~/models/databases/Media'
import { MediaUploadRes } from '~/models/Others'
import databaseService from '~/services/database.services'
import { getNameFromFullname, handleUploadImages } from '~/utils/file'
import { uploadFileToS3 } from '~/utils/s3'

class MediasService {
  async uploadImages(req: Request, userId: ObjectId) {
    const images = await handleUploadImages(req)
    const result: MediaUploadRes[] = await Promise.all(
      images.map(async (image) => {
        const newName = getNameFromFullname(image.newFilename)
        const newFullName = `${newName}.jpg`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
        if (image.newFilename !== newFullName) {
          await sharp(image.filepath).jpeg().toFile(newPath)
        }
        await uploadFileToS3({
          filename: `images/${newFullName}`,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        try {
          await Promise.all([
            fsPromise.unlink(image.filepath),
            fsPromise.unlink(newPath),
            // Lưu ảnh vào DB
            databaseService.medias.insertOne(
              new Media({
                name: newFullName,
                type: MediaType.Image,
                userId
              })
            )
          ])
        } catch (error) {
          console.log(error)
        }
        return {
          name: newFullName,
          type: MediaType.Image
        }
      })
    )
    return {
      medias: result
    }
  }
}

const mediasService = new MediasService()
export default mediasService
