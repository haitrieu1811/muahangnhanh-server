import { ParamsDictionary } from 'express-serve-static-core'

export type CreateFolderReqBody = {
  name: string
  parentId?: string
}

export type UpdateFolderReqBody = {
  name: string
}

export type FolderIdReqParams = ParamsDictionary & {
  folderId: string
}
