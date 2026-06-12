import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default {
  install(app) {
    // 全局注册图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  },
}
