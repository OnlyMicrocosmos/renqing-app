import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      // 添加模板编译选项解决可能的模板解析问题
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-') // 如果有自定义元素
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 添加更多路径别名解决模块解析问题
      '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
      '~@fortawesome': resolve(__dirname, 'node_modules/@fortawesome')
    },
    // 显式指定扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  base: './',
  server: {
    port: 3000, // 确保与API客户端配置一致
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true, // 保持开启便于调试
    // 添加分块优化
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将大依赖拆分成单独 chunk
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    // 增加资源大小限制
    chunkSizeWarningLimit: 1500 // KB
  },
  optimizeDeps: {
    include: [
      'vue', 
      'vue-router', 
      'pinia',
      'axios'
    ],
    exclude: ['vue-demi']
  },
  // 添加 CSS 配置解决样式问题
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  // 添加错误覆盖层
  clearScreen: false,
  logLevel: 'info'
})