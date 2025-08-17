<template>
  <!-- 当认证状态正在初始化时显示加载界面 -->
  <div v-show="authStore.initializing" class="app-loading">
    <div class="loader"></div>
    <p>应用初始化中... {{ authStore.initializationStep }}</p>
    <p>状态: initializing={{ authStore.initializing }}, isInitialized={{ authStore.isInitialized }}</p>
    <button @click="forceCompleteInit">跳过初始化</button>
  </div>
  
  <!-- 初始化完成后显示应用内容 -->
  <div v-show="!authStore.initializing" class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="container flex-between">
        <!-- 品牌标识 -->
        <router-link to="/" class="logo">
          <i class="icon-gift"></i>
          <span>人情账本</span>
        </router-link>
        
        <!-- 主导航（登录后显示） -->
        <nav v-if="isAuthenticated" class="nav-menu">
          <router-link v-for="route in mainRoutes" :key="route.name" :to="{ name: route.name }" class="nav-link">
            <i :class="'icon-' + route.meta.icon"></i>
            <span>{{ route.meta.title }}</span>
          </router-link>
        </nav>
        
        <!-- 用户操作区 -->
        <div class="user-actions">
          <!-- 登录状态 -->
          <template v-if="isAuthenticated">
            <!-- 通知提醒 -->
            <div class="notifications">
              <button @click="toggleNotifications" class="notify-btn">
                <i class="icon-bell"></i>
                <span v-if="pendingReminders.length" class="badge">{{ pendingReminders.length }}</span>
              </button>
              <div v-if="showNotifications" class="notifications-panel">
                <h4>待处理提醒</h4>
                <div v-if="pendingReminders.length">
                  <div v-for="reminder in pendingReminders" :key="reminder.id" class="notification-item">
                    <div class="notification-content">
                      <strong>{{ reminder.title }}</strong>
                      <p>{{ reminder.message }}</p>
                      <small>{{ formatDate(reminder.date) }}</small>
                    </div>
                    <button @click="markAsRead(reminder)" class="btn-icon">
                      <i class="icon-check"></i>
                    </button>
                  </div>
                </div>
                <div v-else class="empty-notifications">
                  没有待处理的提醒
                </div>
              </div>
            </div>
            
            <!-- 用户信息 -->
            <div class="user-profile">
              <img :src="userAvatar" class="avatar" alt="用户头像" />
              <div class="user-info">
                <span class="username">{{ username }}</span>
                <div class="user-menu">
                  <router-link to="/settings/profile">个人资料</router-link>
                  <router-link to="/settings">系统设置</router-link>
                  <button @click="logout" class="logout-btn">退出登录</button>
                </div>
              </div>
            </div>
          </template>
          
          <!-- 未登录状态 -->
          <template v-else>
            <router-link to="/login" class="btn btn-outline">登录</router-link>
            <router-link to="/register" class="btn btn-primary">注册</router-link>
          </template>
        </div>
      </div>
    </header>
    
    <!-- 面包屑导航 -->
    <div v-if="isAuthenticated && breadcrumbs.length" class="breadcrumbs">
      <div class="container">
        <router-link v-for="(crumb, index) in breadcrumbs" 
                    :key="index"
                    :to="crumb.path" 
                    class="breadcrumb-item"
                    :class="{ 'active': index === breadcrumbs.length - 1 }">
          {{ crumb.name }}
          <span v-if="index < breadcrumbs.length - 1" class="divider">/</span>
        </router-link>
      </div>
    </div>
    
    <!-- 主要内容区 -->
    <main class="app-main">
      <div class="container">
        <!-- 加载状态指示器 -->
        <div v-if="loading" class="loading-overlay">
          <div class="loader"></div>
        </div>
        
        <!-- 路由视图容器 -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
    
    <!-- 应用页脚 -->
    <footer class="app-footer">
      <div class="container flex-between">
        <div class="copyright">
          &copy; {{ new Date().getFullYear() }} 人情账本. 保留所有权利.
        </div>
        <div class="footer-links">
          <a href="#" @click.prevent="showAbout">关于</a>
          <a href="#" @click.prevent="showHelp">帮助</a>
          <a href="#" @click.prevent="showPrivacy">隐私政策</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
console.log('[APP] Component script setup started');

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useContactStore } from '@/stores/contact.store'
import { useEventStore } from '@/stores/event.store'
import dateUtil from '@/utils/date.js'
import { setupReminders } from '@/utils/reminder'

console.log('[APP] All imports successful');

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const contactStore = useContactStore()
const eventStore = useEventStore()

console.log('[APP] Stores initialized');

// 响应式数据
const showNotifications = ref(false)
const loading = ref(false)
const mainRoutes = ref([])
const breadcrumbs = ref([])
const pendingReminders = ref([])

console.log('[APP] Reactive data initialized');

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)
const username = computed(() => authStore.fullName || authStore.user?.username || '未知用户')
const userAvatar = computed(() => authStore.user?.avatar || '/default-avatar.png')

console.log('[APP] Computed properties initialized');

// 生命周期钩子
onMounted(() => {
  console.log('[APP] Component mounted');
  console.log('[APP] Initial auth store state:', {
    isInitialized: authStore.isInitialized,
    initializing: authStore.initializing,
    isAuthenticated: authStore.isAuthenticated,
    initializationStep: authStore.initializationStep
  });
  
  // 初始化应用
  initializeApp()
  
  // 设置提醒功能
  setupReminders()
  
  // 如果尚未开始初始化，手动触发
  if (!authStore.isInitialized && !authStore.initializing) {
    console.log('[APP] Triggering initialization from App.vue')
    authStore.setInitializing(true)
    
    // 设置初始化超时定时器
    const initTimeout = setupInitializationTimeout(5000)
    
    authStore.initFromStorage().finally(() => {
      clearTimeout(initTimeout)
      authStore.setInitializing(false);
      console.log('[APP] Initialization completed', {
        isInitialized: authStore.isInitialized,
        isAuthenticated: authStore.isAuthenticated
      });
    });
  }
  
  /**
   * 设置初始化超时处理
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {number} - 定时器ID
   */
  function setupInitializationTimeout(timeout) {
    console.log(`[APP] Setting up initialization timeout for ${timeout}ms`)
    return setTimeout(() => {
      console.log('[APP] Initialization timeout, forcing completion');
      authStore.setInitializing(false);
      authStore.setInitialized(true);
    }, timeout);
  }
})

onUnmounted(() => {
  console.log('[APP] Component unmounted');
})

// 方法定义
async function initializeApp() {
  console.log('[APP] Initializing app data');
  try {
    loading.value = true
    
    // 初始化联系人和事件数据
    if (authStore.isAuthenticated) {
      console.log('[APP] User is authenticated, loading contacts and events');
      await Promise.all([
        contactStore.loadContacts(),
        eventStore.loadEvents()
      ])
    }
    
    // 更新路由信息
    updateNavigation()
  } catch (error) {
    console.error('[APP] 初始化应用数据失败:', error)
  } finally {
    loading.value = false
  }
}

function updateNavigation() {
  console.log('[APP] Updating navigation');
  
  // 主要路由
  mainRoutes.value = router.options.routes.filter(route => 
    route.meta?.requiresAuth && route.meta?.icon
  )
  
  // 面包屑导航
  const matched = route.matched.filter(item => item.meta?.title)
  breadcrumbs.value = matched.map(item => ({
    name: item.meta.title,
    path: item.path
  }))
  
  console.log('[APP] Navigation updated', {
    mainRoutesCount: mainRoutes.value.length,
    breadcrumbsCount: breadcrumbs.value.length
  });
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  console.log('[APP] Notifications toggled:', showNotifications.value);
}

function markAsRead(reminder) {
  console.log('[APP] Marking reminder as read:', reminder.id);
  eventStore.markReminderAsRead(reminder.id)
}

function logout() {
  console.log('[APP] User logging out');
  authStore.logout()
  router.push('/login')
}

function formatDate(date) {
  return dateUtil.format(date, 'yyyy-MM-dd')
}

function showAbout() {
  console.log('[APP] Showing about page');
  router.push('/about')
}

function showHelp() {
  console.log('[APP] Showing help page');
  router.push('/help')
}

function showPrivacy() {
  console.log('[APP] Showing privacy policy');
  router.push('/privacy')
}

// 强制完成初始化的函数
function forceCompleteInit() {
  console.log('[APP] Forcing initialization completion');
  authStore.setInitializing(false);
  authStore.setInitialized(true);
}
</script>

<style>
/* 全局样式 */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f7fb;
  overflow: auto; /* 允许滚动 */
}

#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style scoped>
/* 应用加载状态 */
.app-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fb;
}

.app-loading .loader {
  border: 4px solid rgba(67, 97, 238, 0.2);
  border-radius: 50%;
  border-top: 4px solid #4361ee;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

.app-loading p {
  margin-top: 20px;
  color: #4361ee;
  font-size: 1.2rem;
  font-weight: 500;
}

.app-loading button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 基础变量 */
:root {
  --primary: #4361ee;
  --primary-light: #4895ef;
  --secondary: #3f37c9;
  --success: #4cc9f0;
  --danger: #f72585;
  --warning: #f8961e;
  --dark: #2b2d42;
  --light: #f8f9fa;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --border-radius: 8px;
  --box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

/* 布局样式 */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f7fb;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 头部样式 */
.app-header {
  background-color: white;
  box-shadow: var(--box-shadow);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  gap: 8px;
}

.logo i {
  font-size: 1.8rem;
}

/* 导航菜单 */
.nav-menu {
  display: flex;
  gap: 10px;
  margin-left: 30px;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--gray);
  font-size: 0.85rem;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.nav-link i {
  font-size: 1.2rem;
  margin-bottom: 4px;
}

.nav-link:hover {
  background-color: var(--light);
  color: var(--primary);
}

.nav-link.router-link-exact-active {
  background-color: rgba(67, 97, 238, 0.1);
  color: var(--primary);
}

/* 用户操作区 */
.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

/* 通知样式 */
.notifications {
  position: relative;
}

.notify-btn {
  position: relative;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: var(--gray);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: var(--transition);
}

.notify-btn:hover {
  background-color: var(--light);
  color: var(--primary);
}

.badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--danger);
  color: white;
  font-size: 0.65rem;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 4px;
}

.notifications-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 100;
  margin-top: 10px;
  padding: 15px;
}

.notifications-panel h4 {
  margin-top: 0;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--light-gray);
}

.notification-item {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid var(--light-gray);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-content strong {
  color: var(--dark);
}

.notification-content p {
  margin: 5px 0;
  font-size: 0.9rem;
}

.notification-content small {
  color: var(--gray);
  font-size: 0.8rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 1rem;
  transition: var(--transition);
}

.btn-icon:hover {
  color: var(--primary);
}

.empty-notifications {
  text-align: center;
  padding: 20px;
  color: var(--gray);
}

/* 用户资料 */
.user-profile {
  display: flex;
  align-items: center;
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
}

.user-info {
  margin-left: 10px;
}

.username {
  font-weight: 500;
  color: var(--dark);
  cursor: pointer;
}

.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 10px 0;
  width: 160px;
  display: none;
  z-index: 100;
}

.user-profile:hover .user-menu {
  display: block;
}

.user-menu a, .user-menu button {
  display: block;
  width: 100%;
  padding: 8px 15px;
  text-align: left;
  text-decoration: none;
  color: var(--dark);
  background: none;
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.user-menu a:hover, .user-menu button:hover {
  background-color: var(--light);
}

.logout-btn {
  color: var(--danger);
  border-top: 1px solid var(--light-gray);
  margin-top: 5px;
  padding-top: 10px;
}

/* 面包屑导航 */
.breadcrumbs {
  background-color: white;
  padding: 12px 0;
  border-bottom: 1px solid var(--light-gray);
}

.breadcrumb-item {
  text-decoration: none;
  color: var(--gray);
  font-size: 0.9rem;
  transition: var(--transition);
}

.breadcrumb-item:hover {
  color: var(--primary);
}

.breadcrumb-item.active {
  color: var(--dark);
  font-weight: 500;
  pointer-events: none;
}

.divider {
  margin: 0 8px;
  color: var(--light-gray);
}

/* 主内容区 */
.app-main {
  flex: 1;
  padding: 30px 0;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-overlay .loader {
  border: 4px solid rgba(67, 97, 238, 0.2);
  border-radius: 50%;
  border-top: 4px solid var(--primary);
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 页脚样式 */
.app-footer {
  background-color: white;
  padding: 20px 0;
  border-top: 1px solid var(--light-gray);
  color: var(--gray);
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 15px;
}

.footer-links a {
  color: var(--gray);
  text-decoration: none;
  transition: var(--transition);
}

.footer-links a:hover {
  color: var(--primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .logo span {
    display: none;
  }
  
  .user-actions {
    gap: 8px;
  }
  
  .username {
    display: none;
  }
  
  .notifications-panel {
    width: 280px;
    right: -20px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 5px;
  }
}
</style>