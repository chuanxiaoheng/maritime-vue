import request from '@/utils/request'

// 注册方法
export const register = (data) => {
  return request.post('/api/register', data)
}
// 登录方法
export const login = (data) => {
  return request.post('/api/login', data)
}
// 登出方法
export const logout = () => {
  return request.post('/api/logout')
}
