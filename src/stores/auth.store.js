// src/stores/auth.store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import authService from '@/services/api/auth.js'

export const useAuthStore = defineStore('auth', () => {
  // 状态变量
  const isInitialized = ref(false)
  const initializing = ref(false)
  const isAuthenticated = ref(false)
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const tokenNeedsRefresh = ref(false)
  const initializationStep = ref('')
  
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭证
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   */
  async function login(credentials) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.login(credentials);
      
      user.value = response.user;
      isAuthenticated.value = true;
      
      // 持久化存储用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '登录失败，请检查用户名和密码';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 用户注册
   * @param {Object} userData - 用户注册数据
   */
  async function register(userData) {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await authService.register(userData);
      
      user.value = response.user;
      isAuthenticated.value = true;
      
      // 持久化存储用户信息
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '注册失败';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 用户登出
   */
  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 重置状态
    isInitialized.value = false;
  }

  /**
   * 从本地存储初始化用户状态
   */
  async function initFromStorage() {
    // 如果已经初始化，直接返回
    if (isInitialized.value) {
      return;
    }
    
    initializing.value = true;
    initializationStep.value = '检查本地存储';
    
    try {
      // 检查本地存储中的用户信息
      const storedUser = localStorage.getItem('user');
      const storedAccessToken = localStorage.getItem('accessToken');
      
      if (storedUser && storedAccessToken) {
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
      }
    } catch (err) {
      console.error('从本地存储初始化用户状态失败:', err);
      // 清除可能损坏的存储数据
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      initializing.value = false;
      isInitialized.value = true;
      initializationStep.value = '初始化完成';
    }
  }

  /**
   * 刷新访问令牌
   */
  async function refreshAccessToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('没有刷新令牌');
      }
      
      const response = await authService.refreshToken({ refreshToken });
      
      // 更新令牌
      localStorage.setItem('accessToken', response.accessToken);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      tokenNeedsRefresh.value = false;
      return response;
    } catch (err) {
      // 刷新失败，需要重新登录
      logout();
      throw err;
    }
  }

  /**
   * 设置初始化状态
   */
  function setInitializing(value) {
    initializing.value = value;
  }

  /**
   * 设置已初始化状态
   */
  function setInitialized(value) {
    isInitialized.value = value;
  }

  /**
   * 设置初始化步骤
   */
  function setInitializationStep(step) {
    initializationStep.value = step;
  }

  /**
   * 强制完成初始化
   */
  function forceCompleteInitialization() {
    initializing.value = false;
    isInitialized.value = true;
  }

  // 计算属性
  const fullName = computed(() => {
    if (!user.value) return '';
    return user.value.fullName || user.value.nickname || user.value.username;
  });

  const canAccess = computed(() => {
    return isInitialized.value && isAuthenticated.value;
  });

  return {
    // 状态
    isInitialized,
    initializing,
    isAuthenticated,
    user,
    loading,
    error,
    tokenNeedsRefresh,
    initializationStep,
    fullName,
    canAccess,
    
    // 方法
    login,
    register,
    logout,
    initFromStorage,
    refreshAccessToken,
    setInitializing,
    setInitialized,
    setInitializationStep,
    forceCompleteInitialization
  };
});

// 为了向后兼容，保留部分旧的状态结构
export const useAuthStoreOld = defineStore('authOld', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
    isInitialized: false,
    initializing: false,
    initializationStep: ''
  }),
  
  actions: {
    // 简化的初始化方法
    async initFromStorage() {
      this.initializing = true;
      try {
        const storedUser = localStorage.getItem('user');
        const storedAccessToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedAccessToken) {
          this.user = JSON.parse(storedUser);
          this.isAuthenticated = true;
        }
      } catch (err) {
        console.error('初始化失败:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        this.initializing = false;
        this.isInitialized = true;
      }
    },
    
    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      this.isInitialized = false;
    }
  }
});