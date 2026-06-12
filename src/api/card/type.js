import request from '@/utils/request'

// 获取读者证类型数据
export const fetchCardTypeList = () => {
  return request({
    url: '/api/cardType/list',
    method: 'get',
  })
}

// 获取读者证类型分页数据
export const fetchCardTypePage = (params) => {
  return request({
    url: '/api/cardType/page',
    method: 'get',
    params: params,
  })
}

// 添加读者证类型
export const addCardType = (data) => {
  return request({
    url: '/api/cardType/add',
    method: 'post',
    data: data,
  })
}

// 修改读者证类型
export const updateCardType = (data) => {
  return request({
    url: '/api/cardType/update',
    method: 'put',
    data: data,
  })
}

// 单个删除读者证类型
export const deleteCardType = (id) => {
  return request({
    url: '/api/cardType/delete/' + id,
    method: 'delete',
  })
}

// 批量删除读者证类型
export const deleteBatchCardType = (ids) => {
  return request({
    url: '/api/cardType/deleteBatch',
    method: 'delete',
    data: ids,
  })
}
