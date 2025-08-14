import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// 导入全局样式
import '@/assets/styles/main.css'

// 立即创建 Vue 应用实例
const app = createApp(App)

// 使用 Pinia 状态管理
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 注册全局错误处理
app.config.errorHandler = (err) => {
  console.error('Uncaught error:', err)
}

// 立即挂载应用
app.mount('#app')

// --- 数据库初始化 ---
import { initDB } from '@/services/storage/indexedDB'

// 初始化 IndexedDB 数据库
initDB().then(async () => {
  console.log('Database initialized successfully')
  
  try {
    // 使用 Pinia store
    const { useAuthStore } = await import('@/stores/auth.store')
    const authStore = useAuthStore()
    
    // 从存储初始化认证状态
    await authStore.initFromStorage()
    
    // 如果用户已登录，预加载数据
    if (authStore.isAuthenticated) {
      const { useEventStore } = await import('@/stores/event.store')
      const { useContactStore } = await import('@/stores/contact.store')
      
      const eventStore = useEventStore()
      const contactStore = useContactStore()
      
      // 并行加载初始数据
      await Promise.allSettled([
        eventStore.loadEvents(),
        contactStore.loadContacts()
      ])
      
      console.log('Initial data loaded')
    }
  } catch (error) {
    console.error('Failed to initialize stores:', error)
  }
}).catch(error => {
  console.error('Failed to initialize database:', error)
})

// --- PWA功能注册 ---
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registered:', registration)
        registration.update()
      })
      .catch(error => {
        console.log('ServiceWorker registration failed:', error)
      })
  })
}

// --- 添加移动端视口控制 ---
const setViewportScale = () => {
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
  } else {
    const meta = document.createElement('meta')
    meta.name = 'viewport'
    meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    document.head.appendChild(meta)
  }
}

setViewportScale()

// --- 初始化提醒服务 ---
import { initReminderService } from '@/utils/reminder'

// 只在用户授权后初始化提醒
const initReminders = async () => {
  try {
    const { useAuthStore } = await import('@/stores/auth.store')
    const authStore = useAuthStore()
    
    if (authStore.isAuthenticated) {
      initReminderService()
      console.log('Reminder service initialized')
    }
  } catch (error) {
    console.error('Failed to initialize reminders:', error)
  }
}

// 延迟初始化提醒服务
setTimeout(initReminders, 2000)

// --- 添加令牌刷新机制 ---
const setupTokenRefresh = async () => {
  try {
    const { useAuthStore } = await import('@/stores/auth.store')
    const authStore = useAuthStore()
    
    // 确保已初始化存储
    if (!authStore.isInitialized) {
      await authStore.initFromStorage()
    }
    
    if (authStore.isAuthenticated) {
      // 设置定时刷新令牌（每25分钟）
      setInterval(async () => {
        try {
          await authStore.refreshAccessToken()
          console.log('Access token refreshed')
        } catch (error) {
          console.error('Failed to refresh token:', error)
        }
      }, 25 * 60 * 1000) // 25分钟
    }
  } catch (error) {
    console.error('Failed to setup token refresh:', error)
  }
}

// 延迟设置令牌刷新
setTimeout(setupTokenRefresh, 3000)