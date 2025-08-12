import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { getFromDB } from './storage/indexedDB'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.human-account.com/v1',
  timeout: 10000, // 10秒超时
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
  async (config) => {
    // 尝试从本地存储获取用户信息
    let token = null
    try {
      const user = await getFromDB('user')
      token = user?.token
    } catch (error) {
      console.warn('Failed to get user from DB:', error)
    }
    
    // 如果本地存储没有，尝试从 Pinia 状态获取
    if (!token) {
      const authStore = useAuthStore()
      token = authStore.user?.token
    }
    
    // 添加认证头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加请求标识（用于取消请求）
    config.headers['X-Request-ID'] = generateRequestId()
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理响应和错误
apiClient.interceptors.response.use(
  (response) => {
    // 成功响应处理
    return {
      status: response.status,
      data: response.data,
      headers: response.headers
    }
  },
  async (error) => {
    // 错误处理
    if (!error.response) {
      // 网络错误或超时
      return Promise.reject({
        message: '网络连接错误，请检查您的网络连接',
        isNetworkError: true
      })
    }
    
    const { status, data } = error.response
    let errorMessage = '请求处理失败'
    
    // 处理特定状态码
    switch (status) {
      case 400:
        errorMessage = data.message || '请求参数错误'
        break
      case 401:
        errorMessage = data.message || '登录已过期，请重新登录'
        // 触发登出逻辑
        const authStore = useAuthStore()
        authStore.logout()
        break
      case 403:
        errorMessage = data.message || '您没有权限执行此操作'
        break
      case 404:
        errorMessage = data.message || '请求的资源不存在'
        break
      case 409:
        errorMessage = data.message || '资源冲突，请检查数据'
        break
      case 500:
        errorMessage = data.message || '服务器内部错误'
        break
      case 503:
        errorMessage = data.message || '服务暂时不可用，请稍后再试'
        break
      default:
        errorMessage = data.message || `请求失败，状态码: ${status}`
    }
    
    // 返回统一错误格式
    return Promise.reject({
      message: errorMessage,
      status,
      data,
      isApiError: true
    })
  }
)

// 生成唯一请求ID
function generateRequestId() {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
}

// 封装常用HTTP方法
export default {
  /**
   * 发送GET请求
   * @param {string} url 
   * @param {Object} params 
   * @param {Object} config 
   * @returns {Promise}
   */
  get(url, params = {}, config = {}) {
    return apiClient.get(url, { params, ...config })
  },
  
  /**
   * 发送POST请求
   * @param {string} url 
   * @param {Object} data 
   * @param {Object} config 
   * @returns {Promise}
   */
  post(url, data = {}, config = {}) {
    return apiClient.post(url, data, config)
  },
  
  /**
   * 发送PUT请求
   * @param {string} url 
   * @param {Object} data 
   * @param {Object} config 
   * @returns {Promise}
   */
  put(url, data = {}, config = {}) {
    return apiClient.put(url, data, config)
  },
  
  /**
   * 发送PATCH请求
   * @param {string} url 
   * @param {Object} data 
   * @param {Object} config 
   * @returns {Promise}
   */
  patch(url, data = {}, config = {}) {
    return apiClient.patch(url, data, config)
  },
  
  /**
   * 发送DELETE请求
   * @param {string} url 
   * @param {Object} config 
   * @returns {Promise}
   */
  delete(url, config = {}) {
    return apiClient.delete(url, config)
  },
  
  /**
   * 上传文件
   * @param {string} url 
   * @param {File} file 
   * @param {Object} extraData 
   * @param {Function} onProgress 
   * @returns {Promise}
   */
  upload(url, file, extraData = {}, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)
    
    // 添加额外数据
    Object.keys(extraData).forEach(key => {
      formData.append(key, extraData[key])
    })
    
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && typeof onProgress === 'function') {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }
    })
  },
  
  /**
   * 取消请求
   * @param {string} requestId 请求ID
   */
  cancelRequest(requestId) {
    // 这里需要实现取消逻辑，通常使用axios的CancelToken
    // 简化实现，实际项目中需要维护一个请求映射表
    console.warn(`取消请求 ${requestId} - 需要实现具体逻辑`)
  }
}