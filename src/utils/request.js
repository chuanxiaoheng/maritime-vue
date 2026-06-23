import axios from 'axios'
import store from '@/store/index'
import { ElMessage } from 'element-plus'
import router from '@/router'
// 创建请求对象
const request = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
})

// 增加请求拦截器
request.interceptors.request.use(
  (config) => {
    // 主动添加TOKEN令牌 请求头参数
    const token = store.state.token
    if (token) {
      config.headers['Auth-Token'] = token
    }
    return config
  },
  (err) => {
    console.log('请求错误：' + err)
    ElMessage.error('请求发送失败，请稍后重试')
    return Promise.reject(err)
  },
)

request.interceptors.response.use(
  (response) => {
    // 获取响应数据
    const res = response.data
    // 统一返回结果处理
    if (res.code != undefined && res.code !== 200) {
      // 获取响应说明
      const message = res.msg || '请求操作失败'
      // 根据响应码,显示错误信息
      if (res.code === 401) {
        ElMessage.error(message + '请重新登录')
        setTimeout(() => {
          store.dispatch('logout')
          router.push('/login')
        }, 500)
      } else if (res.code === 403) {
        // 请求权限不足
        ElMessage.error(message + '无权限执行此操作')
      } else {
        ElMessage.error(message)
      }

      return Promise.reject(message)
    }
    // 返回响应数据
    return res
  },
  (err) => {
    if (err.response.status === 404) {
      ElMessage.error('请求资源不存在')
    } else if (err.response.status === 500) {
      ElMessage.error('服务器正在休息，请稍后重试')
    } else if (err.response.status === 401) {
      ElMessage.error('登录已过期')
      store.dispatch('logout')
      router.push('/login')
    } else {
      ElMessage.error(err.message)
    }
    return Promise.reject(err)
  },
)

export default request
