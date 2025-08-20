import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue' // 添加 Vue 插件
import path from 'path'

export default defineConfig({
  plugins: [
    vue() // 添加 Vue 插件
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets')
    }
  },
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false'
  },
  server: {
    host: 'localhost',
    port: 3000,
    open: true // 自动打开浏览器
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  base: './' // 使用相对路径以支持 GitHub Pages 等静态托管
})