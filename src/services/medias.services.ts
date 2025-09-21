import { Request } from 'express'
import fsPromise from 'fs/promises'
import mime from 'mime'
import { ObjectId } from 'mongodb'
import path from 'path'
import sharp from 'sharp'

import { ENV_CONFIG } from '~/constants/config'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { MediaType } from '~/constants/enum'
import Media from '~/models/databases/Media'
import { MediaUploadRes } from '~/models/Others'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { getNameFromFullname, handleUploadImages } from '~/utils/file'
import { configurePagination } from '~/utils/helpers'
import { deleteFileFromS3, uploadFileToS3 } from '~/utils/s3'

class MediasService {
  // Tải ảnh lên
  async uploadImages(req: Request, userId: ObjectId) {
    const images = await handleUploadImages(req)
    const result: MediaUploadRes[] = await Promise.all(
      images.map(async (image) => {
        const newName = getNameFromFullname(image.newFilename)
        const newFullName = `${newName}.png`
        const newPath = path.resolve(UPLOAD_IMAGE_DIR, newFullName)
        if (image.newFilename !== newFullName) {
          await sharp(image.filepath).png().toFile(newPath)
        }
        await uploadFileToS3({
          filename: `images/${newFullName}`,
          filepath: newPath,
          contentType: mime.getType(newPath) as string
        })
        try {
          await Promise.all([fsPromise.unlink(image.filepath), fsPromise.unlink(newPath)])
        } catch (error) {
          console.log(error)
        }
        // Lưu thông tin ảnh vào DB
        const { insertedId } = await databaseService.medias.insertOne(
          new Media({
            name: newFullName,
            type: MediaType.Image,
            userId
          })
        )
        return {
          _id: insertedId,
          name: newFullName,
          type: MediaType.Image,
          url: `${ENV_CONFIG.SERVER_HOST}/static/images/${newFullName}`
        }
      })
    )
    return {
      medias: result
    }
  }

  // Xóa hình ảnh trên DB và AWS S3
  async deleteImage(imageId: ObjectId) {
    const deletedImage = await databaseService.medias.findOneAndDelete({
      _id: imageId
    })
    if (deletedImage) {
      await deleteFileFromS3(`images/${deletedImage.name}`)
    }
    return true
  }

  // Lấy danh sách hình ảnh
  async getImages({ userId, query }: { userId: ObjectId; query: PaginationReqQuery }) {
    const { skip, page, limit } = configurePagination(query)
    const [images, totalImages] = await Promise.all([
      databaseService.medias
        .aggregate([
          {
            $match: {
              userId
            }
          },
          {
            $addFields: {
              url: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$name']
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              url: {
                $first: '$url'
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
        ])
        .toArray(),
      databaseService.medias.countDocuments({
        userId
      })
    ])
    return {
      images,
      page,
      limit,
      totalRows: totalImages,
      totalPages: Math.ceil(totalImages / limit)
    }
  }
}

const mediasService = new MediasService()
export default mediasService
