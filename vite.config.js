import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 旧写法
      // '@': path.resolve(__dirname,'./src'),
      // 新写法
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 在每个 SCSS 文件开头自动注入代码
  // 注意：路径要正确，末尾加分号，允许多个
  // 推荐使用 @use "... " as *; 而不是 @import，因为 @import 已被 Sass 官方标记为过时，且 @use 能更好地处理命名空间和避免变量重复定义警告。
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/_variables.scss" as *;`,
      },
    },
  },
})
