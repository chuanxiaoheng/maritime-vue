import request from '@/utils/request'

// 获取图书分页数据
export const fetchBookPage = (params) => {
  return request.get('/api/book/bookPage', {
    params,
  })
}
// 添加图书
export const addBook = (data) => {
  return request.post('/api/book/add', data)
}
// 修改图书
export const updateBook = (data) => {
  return request.put('/api/book/update', data)
}
// 删除图书
export const deleteBook = (id) => {
  return request.delete('/api/book/delete/' + id)
}
// 批量删除图书
export const deleteBatchBook = (ids) => {
  return request.delete('/api/book/deleteBatch', {
    data: ids,
  })
}
// 获取图书分页数据
export const fetchDisplayPage = (params) => {
  return request.get('/api/book/displayPage', {
    params,
  })
}
