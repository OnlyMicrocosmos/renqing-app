// src/stores/auth.store.js
import { defineStore } from 'pinia'
import authService from '@/services/api/auth.js'
import { getDB, saveToDB, getFromDB } from '@/services/storage/indexedDB.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null,
    isInitialized: false
  }),

  actions: {
    /**
     * 从存储中初始化认证状态
     */
    async initFromStorage() {
      try {
        // 确保数据库就绪
        const db = await getDB()
        
        // 检查 'auth' 对象存储是否存在
        if (!db.objectStoreNames.contains('auth')) {
          console.warn('对象存储 "auth" 不存在，跳过初始化')
          this.isInitialized = true
          return false
        }

        // 获取所有用户数据
        const transaction = db.transaction(['auth'], 'readonly')
        const store = transaction.objectStore('auth')
        const request = store.getAll()
        
        request.onsuccess = (event) => {
          const authData = event.target.result
          console.log('从auth存储获取数据:', authData)
          
          // 如果有用户数据，更新状态
          if (authData && authData.length > 0) {
            this.user = {
              id: authData[0].id,
              username: authData[0].username,
              email: authData[0].email
            }
            this.accessToken = 'fake-access-token-' + authData[0].id
            this.refreshToken = 'fake-refresh-token-' + authData[0].id
            this.isAuthenticated = true
          }
          
          this.isInitialized = true
        }
        
        request.onerror = (event) => {
          console.error('从数据库读取认证信息失败:', event.target.error)
          this.isInitialized = true
        }
      } catch (error) {
        console.error('数据库初始化失败:', error)
        this.isInitialized = true
        return false
      }
    },
    
    /**
     * 用户登录
     * @param {Object} credentials - 登录凭证
     * @param {string} credentials.username - 用户名
     * @param {string} credentials.password - 密码
     */
    async login(credentials) {
      this.loading = true
      this.error = null
      
      try {
        // 构造正确的登录参数
        const loginCredentials = {
          password: credentials.password
        }
        
        // 判断是用户名还是邮箱
        if (credentials.username) {
          if (credentials.username.includes('@')) {
            loginCredentials.email = credentials.username
          } else {
            loginCredentials.username = credentials.username
          }
        }
        
        // 先尝试从本地数据库查找用户
        const db = await getDB()
        if (!db.objectStoreNames.contains('auth')) {
          throw new Error('用户数据库未初始化')
        }
        
        return new Promise((resolve, reject) => {
          const transaction = db.transaction(['auth'], 'readonly')
          const store = transaction.objectStore('auth')
          
          let request
          if (loginCredentials.email) {
            // 通过邮箱查找
            const index = store.index('email')
            request = index.get(loginCredentials.email)
          } else if (loginCredentials.username) {
            // 通过用户名查找
            const index = store.index('username')
            request = index.get(loginCredentials.username)
          } else {
            reject(new Error('请输入用户名或邮箱'))
            return
          }
          
          request.onsuccess = (event) => {
            const user = event.target.result
            if (!user) {
              reject(new Error('用户不存在'))
              return
            }
            
            // 验证密码（简化验证，实际应该使用加密）
            if (user.password !== loginCredentials.password) {
              reject(new Error('密码错误'))
              return
            }
            
            // 登录成功
            this.user = {
              id: user.id,
              username: user.username,
              email: user.email
            }
            this.accessToken = 'fake-access-token-' + user.id
            this.refreshToken = 'fake-refresh-token-' + user.id
            this.isAuthenticated = true
            
            // 持久化存储
            localStorage.setItem('user', JSON.stringify(this.user))
            localStorage.setItem('accessToken', this.accessToken)
            localStorage.setItem('refreshToken', this.refreshToken)
            
            resolve(this.user)
          }
          
          request.onerror = (event) => {
            reject(new Error('登录失败: ' + event.target.error))
          }
        })
      } catch (error) {
        this.error = error.message || '登录失败，请检查用户名和密码'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 用户注册
     * @param {Object} userData - 用户注册数据
     */
    async register(userData) {
      this.loading = true
      this.error = null
      
      try {
        // 表单验证
        if (!userData.username || !userData.email || !userData.password) {
          throw new Error('请填写所有必填字段')
        }
        
        if (userData.password !== userData.confirmPassword) {
          throw new Error('两次输入的密码不一致')
        }
        
        // 检查用户是否已存在
        const db = await getDB()
        if (!db.objectStoreNames.contains('auth')) {
          throw new Error('用户数据库未初始化')
        }
        
        // 检查邮箱是否已被注册
        const emailExists = await new Promise((resolve, reject) => {
          const transaction = db.transaction(['auth'], 'readonly')
          const store = transaction.objectStore('auth')
          const index = store.index('email')
          const request = index.get(userData.email)
          
          request.onsuccess = () => {
            resolve(!!request.result)
          }
          
          request.onerror = (event) => {
            reject(new Error('检查邮箱失败: ' + event.target.error))
          }
        })
        
        if (emailExists) {
          throw new Error('该邮箱已被注册')
        }
        
        // 检查用户名是否已被注册
        const usernameExists = await new Promise((resolve, reject) => {
          const transaction = db.transaction(['auth'], 'readonly')
          const store = transaction.objectStore('auth')
          const index = store.index('username')
          const request = index.get(userData.username)
          
          request.onsuccess = () => {
            resolve(!!request.result)
          }
          
          request.onerror = (event) => {
            reject(new Error('检查用户名失败: ' + event.target.error))
          }
        })
        
        if (usernameExists) {
          throw new Error('该用户名已被注册')
        }
        
        // 添加新用户到数据库
        const newUser = {
          username: userData.username,
          email: userData.email,
          password: userData.password, // 注意：实际应用中应该加密存储密码
          createdAt: new Date().toISOString()
        }
        
        await new Promise((resolve, reject) => {
          const transaction = db.transaction(['auth'], 'readwrite')
          const store = transaction.objectStore('auth')
          const request = store.add(newUser)
          
          request.onsuccess = () => {
            newUser.id = request.result
            console.log('用户注册成功:', newUser)
            resolve()
          }
          
          request.onerror = (event) => {
            reject(new Error('注册失败: ' + event.target.error))
          }
        })
        
        // 注册后自动登录
        this.user = {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
        this.accessToken = 'fake-access-token-' + newUser.id
        this.refreshToken = 'fake-refresh-token-' + newUser.id
        this.isAuthenticated = true
        
        localStorage.setItem('user', JSON.stringify(this.user))
        localStorage.setItem('accessToken', this.accessToken)
        localStorage.setItem('refreshToken', this.refreshToken)
        
        return this.user
      } catch (error) {
        this.error = error.message || '注册失败，请重试'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 刷新访问令牌
     */
    async refreshAccessToken() {  // 重命名避免与state属性冲突
      if (!this.refreshToken) return
      
      try {
        const response = await authService.refreshToken(this.refreshToken)
        
        this.accessToken = response.accessToken
        localStorage.setItem('accessToken', response.accessToken)
        
        return response
      } catch (error) {
        console.error('刷新令牌失败:', error)
        this.logout() // 刷新失败则强制退出
        throw error // 抛出错误以便调用方处理
      }
    },

    /**
     * 用户退出登录
     */
    logout() {
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.isAuthenticated = false
      this.isInitialized = false
      
      // 清除本地存储
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    },

    /**
     * 检查认证状态
     */
    checkAuthStatus() {
      return this.isAuthenticated
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
})