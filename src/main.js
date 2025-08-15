import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 确保导入路由

// 创建 Vue 应用实例
const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err) => {
  console.error('全局错误:', err)
  // 可以在这里添加错误提示组件
}

// 立即挂载应用，避免被异步操作阻塞
try {
  app.use(router) // 确保使用路由
  app.mount('#app')
  console.log('[DEBUG] Vue app mounted successfully')
  console.log('[DEBUG] Mount element:', document.getElementById('app'))
} catch (error) {
  console.error('应用挂载失败:', error)
}

// 调试挂载点状态
setTimeout(() => {
  const appElement = document.getElementById('app')
  console.log('[DEBUG] App element after mount:', appElement)
  if (appElement) {
    console.log('[DEBUG] App element innerHTML:', appElement.innerHTML)
  }
}, 1000)