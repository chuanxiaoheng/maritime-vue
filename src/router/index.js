import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store'
import { ElMessage } from 'element-plus'
import Layout from '@/views/layout/Layout.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'
const routes = [
  // 登录
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true },
  },
  // 注册
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', public: true },
  },
  // 主页
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      // 仪表盘
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '主页', pageName: '仪表盘', requireAuth: true },
      },
      // 个人中心
      {
        path: '/user/personal',
        name: 'PersonalCenter',
        component: () => import('@/views/user/PersonalCenter.vue'),
        meta: { title: '个人中心', pageName: '个人中心', requireAuth: true },
      },
      // 账户设置
      {
        path: '/user/settings',
        name: 'AccountSetting',
        component: () => import('@/views/user/AccountSetting.vue'),
        meta: { title: '账户设置', pageName: '账户设置', requireAuth: true },
      },
      // 图书列表
      {
        path: '/book/list',
        name: 'BookList',
        component: () => import('@/views/book/BookList.vue'),
        meta: { title: '测试页面', pageName: '测试页面', requireAuth: true },
      },
      // 图书管理
      {
        path: '/book/manager',
        name: 'BookManager',
        component: () => import('@/views/book/BookManager.vue'),
        meta: { title: '图书管理', pageName: '图书列表', requireAuth: true },
      },
      // 图书分类
      {
        path: '/book/category',
        name: 'BookCategory',
        component: () => import('@/views/book/BookCategory.vue'),
        meta: { title: '图书分类', pageName: '图书分类', requireAuth: true },
      },
      // 图书副本
      {
        path: '/book/copy',
        name: 'BookCopy',
        component: () => import('@/views/book/BookCopy.vue'),
        meta: { title: '图书副本', pageName: '图书副本', requireAuth: true },
      },
      // 图书查阅
      {
        path: '/bookDisplay',
        name: 'BookDisplay',
        component: () => import('@/views/BookDisplay.vue'),
        meta: { title: '图书查阅', pageName: '图书查阅', requireAuth: true },
      },
      // 读者证类型
      {
        path: '/card/type',
        name: 'CardType',
        component: () => import('@/views/card/CardType.vue'),
        meta: { title: '读者证类型', pageName: '读者证类型', requireAuth: true },
      },
      // 读者证管理
      {
        path: '/card/manager',
        name: 'CardManager',
        component: () => import('@/views/card/CardManager.vue'),
        meta: { title: '读者证管理', pageName: '读者证管理', requireAuth: true },
      },
      {
        path: '/borrow/borrow',
        name: 'BorrowBook',
        component: () => import('@/views/borrow/BorrowBook.vue'),
        meta: { title: '借还图书', pageName: '借书办理', requireAuth: true },
      },
      {
        path: '/borrow/return',
        name: 'ReturnBook',
        component: () => import('@/views/borrow/ReturnBook.vue'),
        meta: { title: '借还图书', pageName: '还书办理', requireAuth: true },
      },
      {
        path: '/borrow/record',
        name: 'BorrowRecord',
        component: () => import('@/views/borrow/BorrowRecord.vue'),
        meta: { title: '借阅历史', pageName: '借阅历史', requireAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from) => {
  // 设置页签的标题
  document.title = to.meta.title || '海商图书管理系统'
  // 判断是否已经授权
  if (to.meta.requireAuth && !store.getters.isLogin) {
    ElMessage.info('请先登录')
    return '/login'
  } else if (to.meta.public && store.getters.isLogin) {
    // 如果已经登录（授权成功，令牌有效，直接跳转主页）
    return '/'
  } else {
    return true
  }
})
export default router
