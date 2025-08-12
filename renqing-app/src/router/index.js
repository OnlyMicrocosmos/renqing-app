import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import DashboardView from '../views/DashboardView.vue'
import EventView from '../views/EventView.vue'
import ContactView from '../views/ContactView.vue'
import AnalysisView from '../views/AnalysisView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/events',
    name: 'Events',
    component: EventView
  },
  {
    path: '/contacts',
    name: 'Contacts',
    component: ContactView
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: AnalysisView
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView
  }
  // other routes
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router