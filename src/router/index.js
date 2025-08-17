import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { 
      requiresAuth: true,
      title: '仪表盘',
      icon: 'dashboard'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { 
      guestOnly: true,
      title: '登录',
      layout: 'empty',
      skipInitCheck: true // 添加跳过初始化检查
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { 
      guestOnly: true,
      title: '注册',
      layout: 'empty',
      skipInitCheck: true // 添加跳过初始化检查
    }
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventView.vue'),
    meta: { 
      requiresAuth: true,
      title: '事件管理',
      icon: 'event'
    }
  },
  {
    path: '/events/add',
    name: 'add-event',
    component: () => import('@/components/events/EventForm.vue'),
    meta: { 
      requiresAuth: true,
      title: '添加事件',
      breadcrumb: [{ name: '事件管理', path: '/events' }, { name: '添加事件' }]
    }
  },
  {
    path: '/events/edit/:id',
    name: 'edit-event',
    component: () => import('@/components/events/EventForm.vue'),
    meta: { 
      requiresAuth: true,
      title: '编辑事件',
      breadcrumb: [{ name: '事件管理', path: '/events' }, { name: '编辑事件' }]
    },
    props: true
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('@/views/ContactView.vue'),
    meta: { 
      requiresAuth: true,
      title: '联系人管理',
      icon: 'contacts'
    }
  },
  {
    path: '/contacts/add',
    name: 'add-contact',
    component: () => import('@/components/contact/ContactForm.vue'),
    meta: { 
      requiresAuth: true,
      title: '添加联系人',
      breadcrumb: [{ name: '联系人管理', path: '/contacts' }, { name: '添加联系人' }]
    }
  },
  {
    path: '/contacts/edit/:id',
    name: 'edit-contact',
    component: () => import('@/components/contact/ContactForm.vue'),
    meta: { 
      requiresAuth: true,
      title: '编辑联系人',
      breadcrumb: [{ name: '联系人管理', path: '/contacts' }, { name: '编辑联系人' }]
    },
    props: true
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: () => import('@/views/AnalysisView.vue'),
    meta: { 
      requiresAuth: true,
      title: '分析报表',
      icon: 'analytics'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { 
      requiresAuth: true,
      title: '系统设置',
      icon: 'settings'
    }
  },
  // 加载路由 - 添加调试信息显示
  {
    path: '/loading',
    name: 'loading',
    component: () => import('@/views/LoadingView.vue'),
    meta: { 
      skipInitCheck: true,
      hide: true
    }
  },
  // 错误页面路由
  {
    path: '/error',
    name: 'error',
    component: () => import('@/views/ErrorView.vue'),
    meta: { 
      skipInitCheck: true,
      hide: true
    }
  },
  // 确保默认路由在最后
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
    meta: { hide: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach(async (to, from, next) => {
  console.log(`[ROUTER] Navigating from ${from.path} to ${to.path}`)
  console.log('[ROUTER] Route meta:', to.meta)
  
  // 获取认证状态
  const authStore = useAuthStore()
  
  // 检查是否需要跳过初始化检查
  if (to.meta?.skipInitCheck) {
    console.log('[AUTH] Skipping initialization check for route:', to.path)
    return next()
  }
  
  // 如果初始化未完成，开始初始化过程
  if (!authStore.isInitialized && !authStore.initializing) {
    console.log('[AUTH] Starting initialization process')
    authStore.setInitializing(true)
    
    // 设置初始化超时，避免无限等待
    const initTimeout = setTimeout(() => {
      console.error('[AUTH] Initialization timeout')
      authStore.setInitializing(false)
      authStore.setInitialized(true)
    }, 5000) // 5秒超时
    
    try {
      await authStore.initFromStorage()
      console.log('[AUTH] Initialization completed')
    } catch (error) {
      console.error('[AUTH] Initialization failed:', error)
      
      // 初始化失败时重定向到错误页面
      if (to.path !== '/error') {
        return next({
          name: 'error',
          query: {
            message: '应用初始化失败',
            error: error.message
          }
        })
      }
    } finally {
      clearTimeout(initTimeout)
      authStore.setInitializing(false)
      authStore.setInitialized(true)

      // 初始化完成后跳转到保存的路径
      const redirectPath = localStorage.getItem('redirectPath')
      if (redirectPath) {
        localStorage.removeItem('redirectPath')
        router.push(redirectPath)
      }
    }
  }

  // 如果初始化已完成但当前路由仍需要初始化检查，允许继续导航
  if (authStore.isInitialized && to.meta?.skipInitCheck) {
    return next()
  }
  
  // 如果初始化正在进行中，重定向到加载页面
  if (authStore.initializing) {
    console.log('[AUTH] Initialization in progress, redirecting to loader')
    
    // 保存当前路径，以便初始化完成后跳转回来
    if (to.path !== '/loading') {
      localStorage.setItem('redirectPath', to.fullPath)
    }
    
    return next({ name: 'loading' })
  }
  
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // 检查令牌是否需要刷新
      if (authStore.tokenNeedsRefresh) {
        try {
          await authStore.refreshAccessToken()
          next()
        } catch (error) {
          authStore.logout()
          next({ name: 'login' })
        }
      } else {
        next()
      }
    } else {
      next({ 
        name: 'login',
        query: { redirect: to.fullPath } 
      })
    }
  } 
  // 检查是否仅允许未登录用户访问
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } 
  // 正常导航
  else {
    next()
  }
})

// 路由后置钩子 - 更新页面标题
router.afterEach((to) => {
  const appName = '人情往来管理系统'
  document.title = to.meta.title ? `${to.meta.title} | ${appName}` : appName
  window.scrollTo(0, 0)
})

// 添加路由错误处理
router.onError((error) => {
  console.error('[ROUTER] Navigation error:', error)
  
  // 重定向到错误页面
  router.push({
    name: 'error',
    query: {
      message: '路由导航失败',
      error: error.message
    }
  })
})

export default router