import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth.store'
import './assets/styles/main.css' // 引入全局样式文件

// 创建应用实例
const app = createApp(App)

// 创建Pinia实例
const pinia = createPinia()
app.use(pinia)

// 使用路由器
app.use(router)

// 全局错误处理
app.config.errorHandler = (err, vm, info) => {
  console.error('[Vue] 全局错误', { err, vm, info });
  
  // 显示友好错误界面
  const appEl = document.getElementById('app');
  if (appEl) {
    appEl.innerHTML = `
      <div style="padding: 20px; color: #721c24; background-color: #f8d7da;">
        <h2>应用程序错误</h2>
        <p><strong>${err.message}</strong></p>
        <p>发生在: ${info}</p>
        <button style="padding: 10px; margin-top: 20px;" onclick="location.reload()">
          重新加载应用
        </button>
      </div>
    `;
  }
};

// 添加未捕获异常处理
window.addEventListener('error', (event) => {
  console.error('[Window] 未捕获错误', event.error);
});

// 启动应用
app.mount('#app')

// 在应用启动前确保认证状态已初始化
const authStore = useAuthStore()
authStore.initFromStorage().catch(error => {
  console.error('认证状态初始化失败:', error)
})

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