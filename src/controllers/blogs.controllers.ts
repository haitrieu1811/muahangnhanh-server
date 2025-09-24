import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'

import { BLOGS_MESSAGE } from '~/constants/message'
import { BlogIdReqParams, CreateBlogReqBody, DeleteBlogsReqBody } from '~/models/requests/blogs.requests'
import { TokenPayload } from '~/models/requests/users.requests'
import { PaginationReqQuery } from '~/models/requests/utils.requests'
import blogsService from '~/services/blogs.services'

export const createBlogController = async (req: Request<ParamsDictionary, any, CreateBlogReqBody>, res: Response) => {
  const { userId } = req.decodedAuthorization as TokenPayload
  const result = await blogsService.createBlog({ body: req.body, userId: new ObjectId(userId) })
  res.json({
    message: BLOGS_MESSAGE.CREATE_BLOG_SUCCESS,
    data: result
  })
}

export const udpateBlogController = async (req: Request<BlogIdReqParams, any, CreateBlogReqBody>, res: Response) => {
  const result = await blogsService.updateBlog({ body: req.body, blogId: new ObjectId(req.params.blogId) })
  res.json({
    message: BLOGS_MESSAGE.UPDATE_BLOG_SUCCESS,
    data: result
  })
}

export const getBlogsController = async (
  req: Request<ParamsDictionary, any, any, PaginationReqQuery>,
  res: Response
) => {
  const { blogs, ...pagination } = await blogsService.getBlogs(req.query)
  res.json({
    message: BLOGS_MESSAGE.GET_BLOGS_SUCCESS,
    data: {
      blogs,
      pagination
    }
  })
}

export const getBlogController = async (req: Request<BlogIdReqParams>, res: Response) => {
  const result = await blogsService.getBlog(new ObjectId(req.params.blogId))
  res.json({
    message: BLOGS_MESSAGE.GET_BLOG_SUCCESS,
    data: result
  })
}

export const deleteBlogsController = async (req: Request<ParamsDictionary, any, DeleteBlogsReqBody>, res: Response) => {
  const blogIds = req.body.blogIds.map((blogId) => new ObjectId(blogId))
  const result = await blogsService.deleteBlogs(blogIds)
  res.json({
    message: BLOGS_MESSAGE.DELETE_BLOGS_SUCCESS,
    data: result
  })
}

export const deleteBlogController = async (req: Request<BlogIdReqParams>, res: Response) => {
  await blogsService.deleteBlog(new ObjectId(req.params.blogId))
  res.json({
    message: BLOGS_MESSAGE.DELETE_BLOG_SUCCESS
  })
}
