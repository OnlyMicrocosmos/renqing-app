import { defineStore } from 'pinia';
import { login, register } from '@/services/api/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  actions: {
    async login(username, password, rememberMe) {
      this.loading = true;
      this.error = null;

      try {
        // 调用登录服务
        const user = await login(username, password, rememberMe);
        
        // 设置用户信息
        this.user = user;
        this.isAuthenticated = true;
        
        // 保存token（如果有的话）
        if (user.token) {
          this.token = user.token;
          
          // 如果需要记住登录状态，保存到本地存储
          if (rememberMe) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            sessionStorage.setItem('token', user.token);
            sessionStorage.setItem('user', JSON.stringify(user));
          }
        }
        
        return user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async register(username, email, password) {
      this.loading = true;
      this.error = null;

      try {
        // 调用注册服务
        const user = await register(username, email, password);
        
        // 设置用户信息
        this.user = user;
        this.isAuthenticated = true;
        
        // 保存token（如果有的话）
        if (user.token) {
          this.token = user.token;
          localStorage.setItem('token', user.token);
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        return user;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      // 清除用户信息
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      // 清除本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    },

    // 检查是否已登录
    checkAuth() {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const user = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
        this.isAuthenticated = true;
      }
    }
  },

  getters: {
    // 获取用户信息
    getUser: (state) => state.user,

    // 获取认证状态
    getIsAuthenticated: (state) => state.isAuthenticated,

    // 获取加载状态
    getLoading: (state) => state.loading,

    // 获取错误信息
    getError: (state) => state.error
  }
});