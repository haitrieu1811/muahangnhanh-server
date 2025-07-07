import { Router } from 'express'

import {
  createBlogController,
  deleteBlogsController,
  getBlogController,
  getBlogsController,
  udpateBlogController
} from '~/controllers/blogs.controllers'
import {
  blogAuthorValidator,
  blogIdValidator,
  createBlogValidator,
  deleteBlogsValidator
} from '~/middlewares/blogs.middlewares'
import { accessTokenValidator, isAdminValidator, isVerifiedUserValidator } from '~/middlewares/users.middlewares'
import { paginationValidator } from '~/middlewares/utils.middlewares'

const blogsRouter = Router()

blogsRouter.post(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  createBlogValidator,
  createBlogController
)

blogsRouter.put(
  '/:blogId',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  blogIdValidator,
  blogAuthorValidator,
  createBlogValidator,
  udpateBlogController
)

blogsRouter.get('/', paginationValidator, getBlogsController)

blogsRouter.get('/:blogId', blogIdValidator, getBlogController)

blogsRouter.delete(
  '/',
  accessTokenValidator,
  isVerifiedUserValidator,
  isAdminValidator,
  deleteBlogsValidator,
  deleteBlogsController
)

export default blogsRouter
