import { ObjectId } from 'mongodb'

import { ENV_CONFIG } from '~/constants/config'
import Blog, { AggregateBlog } from '~/models/databases/Blog'
import { CreateBlogReqBody } from '~/models/requests/blogs.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import databaseService from '~/services/database.services'
import { configurePagination } from '~/utils/helpers'

class BlogsService {
  async createBlog({ body, userId }: { body: CreateBlogReqBody; userId: ObjectId }) {
    const { insertedId } = await databaseService.blogs.insertOne(
      new Blog({
        ...body,
        thumbnail: new ObjectId(body.thumbnail),
        userId
      })
    )
    const blog = await databaseService.blogs.findOne({
      _id: insertedId
    })
    return {
      blog
    }
  }

  async updateBlog({ body, blogId }: { body: CreateBlogReqBody; blogId: ObjectId }) {
    const updatedBlog = await databaseService.blogs.findOneAndUpdate(
      {
        _id: blogId
      },
      {
        $set: {
          ...body,
          thumbnail: new ObjectId(body.thumbnail)
        },
        $currentDate: {
          updatedAt: true
        }
      },
      {
        returnDocument: 'after'
      }
    )
    return {
      blog: updatedBlog
    }
  }

  async aggregateBlogs({ match = {}, skip = 0, limit = 20 }: { match?: object; skip?: number; limit?: number }) {
    const blogs = await databaseService.blogs
      .aggregate<AggregateBlog>([
        {
          $match: match
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'thumbnail',
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
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $unwind: {
            path: '$author'
          }
        },
        {
          $lookup: {
            from: 'medias',
            localField: 'author.avatar',
            foreignField: '_id',
            as: 'authorAvatar'
          }
        },
        {
          $unwind: {
            path: '$authorAvatar',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            thumbnail: {
              _id: '$thumbnail._id',
              url: {
                $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$thumbnail.name']
              }
            },
            'author.avatar': {
              $cond: [
                '$authorAvatar',
                {
                  $concat: [ENV_CONFIG.SERVER_HOST, '/static/images/', '$authorAvatar.name']
                },
                ''
              ]
            }
          }
        },
        {
          $group: {
            _id: '$_id',
            thumbnail: {
              $first: '$thumbnail'
            },
            title: {
              $first: '$title'
            },
            author: {
              $first: '$author'
            },
            content: {
              $first: '$content'
            },
            order: {
              $first: '$order'
            },
            status: {
              $first: '$status'
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
            order: 1,
            createdAt: -1
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $project: {
            'thumbnail.userId': 0,
            'thumbnail.name': 0,
            'thumbnail.type': 0,
            'thumbnail.createdAt': 0,
            'thumbnail.updatedAt': 0,
            'author.password': 0,
            'author.status': 0,
            'author.verifyStatus': 0,
            'author.role': 0,
            'author.verifyEmailToken': 0,
            'author.forgotPasswordToken': 0,
            'author.addresses': 0
          }
        }
      ])
      .toArray()
    return {
      blogs
    }
  }

  async getBlogs(query: PaginationReqQuery) {
    const { page, limit, skip } = configurePagination(query)
    const [{ blogs }, totalBlogs] = await Promise.all([
      this.aggregateBlogs({ skip, limit }),
      databaseService.blogs.countDocuments({})
    ])
    return {
      blogs,
      page,
      limit,
      totalRows: totalBlogs,
      totalPages: Math.ceil(totalBlogs / limit)
    }
  }

  async getBlog(blogId: ObjectId) {
    const { blogs } = await this.aggregateBlogs({
      match: { _id: blogId }
    })
    return {
      blog: blogs[0]
    }
  }

  async deleteBlogs(blogIds: ObjectId[]) {
    const { deletedCount } = await databaseService.blogs.deleteMany({
      _id: {
        $in: blogIds
      }
    })
    return {
      deletedCount
    }
  }

  async deleteBlog(blogId: ObjectId) {
    return databaseService.blogs.deleteOne({
      _id: blogId
    })
  }
}

const blogsService = new BlogsService()
export default blogsService
