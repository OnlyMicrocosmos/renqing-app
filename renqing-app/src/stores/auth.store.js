// src/stores/auth.store.js
import { defineStore } from 'pinia';
import authService from '@/services/api/auth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null
  }),

  actions: {
    /**
     * 用户登录
     * @param {Object} credentials - 登录凭证
     * @param {string} credentials.username - 用户名
     * @param {string} credentials.password - 密码
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        // 构造正确的登录参数
        const loginCredentials = {
          password: credentials.password
        };
        
        // 判断是用户名还是邮箱
        if (credentials.username) {
          if (credentials.username.includes('@')) {
            loginCredentials.email = credentials.username;
          } else {
            loginCredentials.username = credentials.username;
          }
        }
        
        const response = await authService.login(loginCredentials);
        
        this.user = response.user;
        this.accessToken = response.accessToken;
        this.refreshToken = response.refreshToken;
        this.isAuthenticated = true;
        
        // 持久化存储
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '登录失败，请检查用户名和密码';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 用户注册
     * @param {Object} userData - 用户注册数据
     */
    async register(userData) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authService.register(userData);
        
        // 注册后自动登录
        if (response.accessToken) {
          this.user = response.user;
          this.accessToken = response.accessToken;
          this.refreshToken = response.refreshToken;
          this.isAuthenticated = true;
          
          localStorage.setItem('user', JSON.stringify(response.user));
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '注册失败，请重试';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 刷新访问令牌
     */
    async refreshAccessToken() {  // 重命名避免与state属性冲突
      if (!this.refreshToken) return;
      
      try {
        const response = await authService.refreshToken(this.refreshToken);
        
        this.accessToken = response.accessToken;
        localStorage.setItem('accessToken', response.accessToken);
        
        return response;
      } catch (error) {
        console.error('刷新令牌失败:', error);
        this.logout(); // 刷新失败则强制退出
        throw error; // 抛出错误以便调用方处理
      }
    },

    /**
     * 用户退出登录
     */
    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      
      // 清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    /**
     * 检查认证状态
     */
    checkAuthStatus() {
      return this.isAuthenticated;
    }
  },

  getters: {
    /**
     * 获取当前用户信息
     */
    currentUser: (state) => state.user,

    /**
     * 检查用户是否已认证
     */
    isAuth: (state) => state.isAuthenticated,

    /**
     * 获取认证错误信息
     */
    authError: (state) => state.error
  }
});