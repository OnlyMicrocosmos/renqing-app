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
    port: 3000,
    open: true,
    strictPort: false,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000 // 显式指定 HMR 端口
    },
    // 添加代理解决 API 请求问题
    proxy: {
      '/api': {
        target: 'http://your-backend-domain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
    // 移除 middlewareMode 配置，该配置与 HTTP 服务器冲突
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
      'axios',
      'dayjs'
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