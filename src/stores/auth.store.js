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
      
      // 注册后自动登录
      if (response.accessToken) {
        user.value = response.user;
        isAuthenticated.value = true;
        
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      
      return response;
    } catch (err) {
      error.value = err.response?.data?.message || err.message || '注册失败，请重试';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 从存储初始化认证状态 - 增强版
   */
  async function initFromStorage() {
    try {
      // 防抖处理
      if (isInitialized.value || initializing.value) {
        console.log('[Auth Store] Already initialized or initializing, skipping');
        return Promise.resolve();
      }
      
      initializing.value = true;
      updateInitializationStep('开始初始化...');
      
      // 使用setTimeout创建微任务，避免阻塞主线程
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // 检查 localStorage 中的用户数据 - 添加数据验证
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          // 验证JSON格式有效性
          updateInitializationStep('验证用户数据...');
          const parsedUser = JSON.parse(storedUser)
          
          // 基本数据验证
          if (!parsedUser || typeof parsedUser !== 'object') {
            throw new Error('无效的用户数据格式')
          }
          
          // 确保必要字段存在
          const requiredFields = ['id', 'username', 'email']
          const missingFields = requiredFields.filter(field => !parsedUser[field])
          
          if (missingFields.length > 0) {
            throw new Error(`缺少必要字段: ${missingFields.join(', ')}`)
          }
          
          user.value = parsedUser
          isAuthenticated.value = true
        } catch (parseError) {
          console.error('用户数据解析失败:', parseError)
          updateInitializationStep('清除无效用户数据...')
          
          // 清除无效的用户数据
          localStorage.removeItem('user')
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }
      
      // 检查令牌有效性
      updateInitializationStep('检查令牌有效期...')
      const accessToken = localStorage.getItem('accessToken')
      
      if (accessToken) {
        // 实际项目中这里应该验证令牌有效期
        // 这里简化为检查令牌是否存在
        tokenNeedsRefresh.value = false
      }
      
      updateInitializationStep('完成初始化')
      isInitialized.value = true
      return Promise.resolve();
    } catch (err) {
      console.error('初始化失败:', err)
      updateInitializationStep(`初始化出错: ${err.message}`)
      
      // 即使出错也要标记为已初始化，避免无限循环
      isInitialized.value = true
      
      // 不再抛出错误，避免阻塞应用
      return Promise.resolve();
    } finally {
      initializing.value = false;
    }
  }

  /**
   * 刷新访问令牌
   */
  async function refreshAccessToken() {
    try {
      updateInitializationStep('刷新访问令牌...')
      
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('刷新令牌不存在')
      }
      
      const response = await authService.refreshToken({ refreshToken })
      
      localStorage.setItem('accessToken', response.accessToken)
      tokenNeedsRefresh.value = false
      
      return response.accessToken
    } catch (error) {
      console.error('令牌刷新失败:', error)
      logout()
      throw error
    }
  }

  /**
   * 用户退出登录
   */
  function logout() {
    user.value = null;
    isAuthenticated.value = false;
    tokenNeedsRefresh.value = false;
    
    // 清除本地存储
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 重置初始化状态
    isInitialized.value = false;
  }

  /**
   * 更新初始化步骤
   * @param {string} step - 当前初始化步骤描述
   */
  function updateInitializationStep(step) {
    initializationStep.value = step
    console.log(`[Auth Store] ${step}`)
  }

  /**
   * 设置初始化状态
   * @param {boolean} value - 是否正在初始化
   */
  function setInitializing(value) {
    initializing.value = value
    if (value) {
      updateInitializationStep('开始初始化...')
    }
  }

  /**
   * 设置初始化完成状态
   * @param {boolean} value - 是否初始化完成
   */
  function setInitialized(value) {
    isInitialized.value = value
  }

  /**
   * 检查认证状态
   * @returns {boolean} 是否已认证
   */
  function checkAuthStatus() {
    return isAuthenticated.value
  }

  // 添加令牌刷新检查逻辑
  function checkTokenRefresh() {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
      tokenNeedsRefresh.value = true
      return
    }
    
    // 实际项目中应解码JWT检查过期时间
    // 这里简化为总是有效，实际应根据业务逻辑实现
    tokenNeedsRefresh.value = false
  }

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
    
    // 方法
    login,
    register,
    initFromStorage,
    logout,
    setInitializing,
    setInitialized,
    checkAuthStatus,
    updateInitializationStep,
    refreshAccessToken, // 新增方法
    checkTokenRefresh  // 新增方法
  }
})