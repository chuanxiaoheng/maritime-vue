import request from '@/utils/request'

// 获取读者证数据
export const fetchCardList = () => {
  return request({
    url: '/api/card/list',
    method: 'get',
  })
}

// 获取读者证类型分页数据
export const fetchCardPage = (params) => {
  return request({
    url: '/api/card/page',
    method: 'get',
    params: params,
  })
}

// 添加读者证类型
export const addCard = (data) => {
  return request({
    url: '/api/card/add',
    method: 'post',
    data: data,
  })
}

// 修改读者证类型
export const updateCard = (data) => {
  return request({
    url: '/api/card/update',
    method: 'put',
    data: data,
  })
}

// 单个删除读者证类型
export const deleteCard = (id) => {
  return request({
    url: '/api/card/delete/' + id,
    method: 'delete',
  })
}

// 批量删除读者证类型
export const deleteBatchCard = (ids) => {
  return request({
    url: '/api/card/deleteBatch',
    method: 'delete',
    data: ids,
  })
}
