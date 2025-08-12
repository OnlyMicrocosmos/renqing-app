import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false
  }),
  actions: {
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },
    logout() {
      this.user = null
      this.isAuthenticated = false
    }
  }
});