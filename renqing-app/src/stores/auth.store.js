import { defineStore } from 'pinia'
import { loginUser, registerUser } from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false,
    error: null
  }),
  actions: {
    async login(credentials) {
      try {
        this.loading = true
        this.error = null
        const user = await loginUser(credentials)
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } catch (error) {
        this.error = error.message || '登录失败，请检查您的用户名和密码'
        return false
      } finally {
        this.loading = false
      }
    },
    async register(userData) {
      try {
        this.loading = true
        this.error = null
        const user = await registerUser(userData)
        this.user = user
        localStorage.setItem('user', JSON.stringify(user))
        return true
      } catch (error) {
        this.error = error.message || '注册失败，请稍后再试'
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      localStorage.removeItem('user')
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    username: (state) => state.user ? state.user.name : '用户'
  }
})