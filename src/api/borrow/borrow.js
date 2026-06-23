import request from '@/utils/request'

// 根据用户名或者读者证号，获取借阅用户
export const addBorrowRecords = (data) => {
  return request({
    url: '/api/borrow/add',
    method: 'post',
    data,
  })
}

// 获取借阅记录分页数据
export const fetchBorrowRecordPage = (params) => {
  return request({
    url: '/api/borrow/page',
    method: 'get',
    params: params,
  })
}
// 修改借阅记录
export const updateBorrowRecord = (data) => {
  return request({
    url: '/api/borrow/update',
    method: 'put',
    data,
  })
}
