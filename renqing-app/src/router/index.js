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
      layout: 'empty'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { 
      guestOnly: true,
      title: '注册',
      layout: 'empty'
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
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
    meta: { hide: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  }
})

// 路由守卫 - 认证检查
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果认证状态未初始化，尝试初始化
  if (!authStore.isInitialized) {
    try {
      await authStore.initFromStorage()
    } catch (error) {
      console.error('Failed to initialize auth store in router guard:', error)
    }
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

export default router