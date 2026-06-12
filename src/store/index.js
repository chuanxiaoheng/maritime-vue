import { createStore } from 'vuex'
// 创建vue容器实例
const store = createStore({
  // 状态管理器中定义的数据源
  state: {
    user: JSON.parse(localStorage.getItem('user') || '{}'),
    token: localStorage.getItem('token') || '',
  },
  // 同步操作
  mutations: {
    // 保存登录成功的用户的信息
    SET_LOGIN_USER(state, user) {
      state.user = user
      // 本地缓存用户信息
      localStorage.setItem('user', JSON.stringify(user))
    },
    // 保存授权的token令牌
    SET_TOKEN(state, token) {
      state.token = token
      // 本地缓存用户token
      localStorage.setItem('token', token)
    },
    // 清除授权的用户数据
    CLEAR_AUTH(state) {
      state.user = {}
      state.token = ''
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    },
    // 更换头像
    SET_AVATAR(state, avatar) {
      state.user.avatar = avatar
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    SET_NOTIFICATION(state, notificationSettings) {
      state.user.receiveDue = notificationSettings.receiveDue
      state.user.receiveEmail = notificationSettings.receiveEmail
      state.user.receiveNotice = notificationSettings.receiveNotice
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    SET_PRIVACY(state, privacySettings) {
      state.user.profileVisible = privacySettings.profileVisible
      state.user.borrowHisVisible = privacySettings.borrowHisVisible
      localStorage.setItem('user', JSON.stringify(state.user))
    },
  },
  // 异步操作
  actions: {
    // 登录保存用户信息
    login({ commit }, { user }) {
      commit('SET_LOGIN_USER', user)
      commit('SET_TOKEN', user.authToken)
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    },
  },
  // getters 类似于计算属性
  getters: {
    // 获取当前用户是否登录(!!将任意值转换为布尔值)
    isLogin: (state) => !!state.token,
  },
})
export default store
