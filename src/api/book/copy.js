import request from '@/utils/request'

// 分页查询图书副本
export const fetchBookCopyPage = (params) => {
  return request({
    url: '/api/copy/selectPage',
    method: 'get',
    params: params,
  })
}

// 新增图书副本
export const addBookCopy = (data) => {
  return request({
    url: '/api/copy/add',
    method: 'post',
    data: data,
  })
}

// 修改图书副本
export const updateBookCopy = (data) => {
  return request({
    url: '/api/copy/update',
    method: 'put',
    data: data,
  })
}

// 删除图书副本
export const deleteBookCopy = (id) => {
  return request({
    url: '/api/copy/delete/' + id,
    method: 'delete',
  })
}
