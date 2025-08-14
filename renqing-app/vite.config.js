import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3001,
    open: true,
    // 添加以下关键配置
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
    middlewareMode: false
  },
  // 添加根目录显式声明
  root: resolve(__dirname, './'),
  // 添加优化依赖配置
  optimizeDeps: {
    include: ['vue', 'vue-router']
  }
})