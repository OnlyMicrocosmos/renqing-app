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
        const response = await authService.login(credentials);
        
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
      this.error = null;
      
      // 清除本地存储
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },

    /**
     * 更新用户信息
     * @param {Object} updatedUser - 更新的用户数据
     */
    async updateUser(updatedUser) {
      try {
        // 调用API更新服务器数据
        const response = await authService.updateUser(this.user.id, updatedUser);
        
        // 更新本地状态
        this.user = { ...this.user, ...response.user };
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || error.message || '更新用户信息失败';
        throw error;
      }
    },
    
    /**
     * 从本地存储初始化状态
     */
    initFromStorage() {
      // 从localStorage加载状态
      const user = JSON.parse(localStorage.getItem('user'));
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (user && accessToken) {
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;
      } else {
        this.logout();
      }
    },
    
    /**
     * 重置错误状态
     */
    resetError() {
      this.error = null;
    }
  },

  getters: {
    /**
     * 获取当前用户ID
     * @returns {string|null} 用户ID
     */
    userId: (state) => state.user?.id || null,
    
    /**
     * 获取用户头像
     * @returns {string} 头像URL
     */
    avatar: (state) => state.user?.avatar || '/src/assets/images/default-avatar.png',
    
    /**
     * 获取用户全名
     * @returns {string} 用户全名
     */
    fullName: (state) => {
      if (!state.user) return '';
      return `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.username;
    },
    
    /**
     * 获取用户角色（用于权限控制）
     * @returns {string} 用户角色
     */
    role: (state) => state.user?.role || 'user'
  }
});