import request from '@/utils/request'
// 更新用户数据
export const updateUser = (data) => {
  return request.put('/api/user/update', data)
}

// 上传头像设置
export const uploadAvatar = (data) => {
  return request.post('/api/user/uploadAvatar', data)
}

// 修改密码设置
export const changePassword = (data) => {
  return request.post('/api/user/changePassword', null, {
    params: data,
  })
}
// 更改通知设置
export const updateNotification = (data) => {
  return request.post('/api/user/updateNotification', data)
}
// 更改隐私设置
export const updatePrivacy = (data) => {
  return request.post('/api/user/updatePrivacy', data)
}

// 注销账户
export const updateUserOff = () => {
  return request.delete('/api/user/off')
}
