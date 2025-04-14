import { PaginationReqQuery } from '~/models/requests/utils.requests'

export const generateRandomString = (length: number): string => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const numberEnumToArray = (numberEnum: { [key: string]: string | number }) => {
  return Object.values(numberEnum).filter((item) => typeof item === 'number') as number[]
}

// Cấu hình phân trang
export const configurePagination = (query: PaginationReqQuery) => {
  const { page, limit } = query
  const _page = Number(page) || 1
  const _limit = Number(limit) || 20
  const skip = (_page - 1) * _limit
  return {
    page: _page,
    limit: _limit,
    skip
  }
}
