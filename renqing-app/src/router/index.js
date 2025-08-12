import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/events',
    name: 'events',
    component: () => import('@/views/EventView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/events/add',
    name: 'add-event',
    component: () => import('@/views/EventForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/events/edit/:id',
    name: 'edit-event',
    component: () => import('@/views/EventForm.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: () => import('@/views/ContactView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contacts/add',
    name: 'add-contact',
    component: () => import('@/views/ContactFormView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/contacts/edit/:id',
    name: 'edit-contact',
    component: () => import('@/views/ContactFormView.vue'),
    meta: { requiresAuth: true },
    props: true
  },
  {
    path: '/analysis',
    name: 'analysis',
    component: () => import('@/views/AnalysisView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router