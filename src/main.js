import { createApp } from 'vue'

import App from './App.vue'
// 引入store,指定store目录，自动访问目录下的index.js
import store from '@/store/index'
// 引入路由
import router from '@/router'
// 引入element-plus
import ElementPlus from 'element-plus'
// 引入element-plus,样式需要单独引进
import 'element-plus/dist/index.css'
// 从@element-plus/icons-vue导入所有图标
import registerIcons from '@/plugins/icon'
// 引入全部样式
import '@/styles/index.scss'
import '@/styles/auth.scss'

// 创建应用
const app = createApp(App)
// 加载状态管理
app.use(store)
// 加载路由
app.use(router)
// 加载element-plus
app.use(ElementPlus)
// 注册图标挂载插件
app.use(registerIcons)
// 挂载app
app.mount('#app')
