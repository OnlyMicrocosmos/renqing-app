// 添加一个早期的调试日志
console.log('[MAIN] Script started executing');

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 创建 Vue 应用实例
const app = createApp(App)

// 创建 Pinia store
const pinia = createPinia()

// 安装插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

console.log('[MAIN] All imports successful');

console.log('[MAIN] Vue app created');

// 添加全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[MAIN] 全局错误:', err)
  console.error('[MAIN] 错误信息:', info)
  console.error('[MAIN] 错误组件:', instance)
  // 可以在这里添加错误提示组件
}

// 添加全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('[MAIN] 全局警告:', msg)
  console.warn('[MAIN] 警告组件:', instance)
  console.warn('[MAIN] 警告追踪:', trace)
}

// 添加 WebSocket 客户端初始化代码

// 立即挂载应用，避免被异步操作阻塞
try {
  console.log('[MAIN] Creating Pinia store')
  const pinia = createPinia()
  
  console.log('[MAIN] Installing plugins')
  app.use(pinia)
  app.use(router)
  
  console.log('[MAIN] Mounting Vue app')
  const mountedApp = app.mount('#app')
  
  console.log('[MAIN] Vue app mounted successfully')
  console.log('[MAIN] Mount element:', document.getElementById('app'))
  
  // 检查挂载状态
  setTimeout(() => {
    const appElement = document.getElementById('app')
    console.log('[MAIN] App element after mount:', appElement)
    if (appElement) {
      console.log('[MAIN] App element has child nodes:', appElement.hasChildNodes())
      console.log('[MAIN] App element innerHTML length:', appElement.innerHTML.length)
      if (appElement.children.length > 0) {
        console.log('[MAIN] First child element:', appElement.children[0])
      }
    }
  }, 0)
} catch (error) {
  console.error('[MAIN] 应用挂载失败:', error)
}

// 添加更多调试信息
document.addEventListener('DOMContentLoaded', () => {
  console.log('[MAIN] DOM fully loaded and parsed')
  console.log('[MAIN] App element exists:', !!document.getElementById('app'))
})

console.log('[MAIN] Script execution completed');