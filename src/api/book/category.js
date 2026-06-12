import request from '@/utils/request'

// 获取图书分页数据
export const fetchCategories = () => {
  return request.get('/api/category/list')
}
// 获取图书分类分页数据
export const fetchCategoryPage = (params) => {
  return request.get('/api/category/page', {
    params,
  })
}
// 添加图书分类
export const addCategory = (data) => {
  return request.post('/api/category/add', data)
}
// 修改图书分类
export const updateCategory = (data) => {
  return request.put('/api/category/update', data)
}
// 删除图书分类
export const deleteCategory = (id) => {
  return request.delete('/api/category/delete/' + id)
}
// 批量删除图书分类
export const deleteBatchCategory = (ids) => {
  return request.delete('/api/category/deleteBatch', {
    data: ids,
  })
}
