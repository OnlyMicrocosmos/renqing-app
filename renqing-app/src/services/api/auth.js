// src/services/api/auth.js
import apiClient from '../apiClient'
import { saveToDB, getFromDB } from '../storage/indexedDB'
import { validateEmail, validatePassword } from '@/utils/validator'

// 用户注册
export const register = async (userData) => {
  try {
    // 表单验证
    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('用户名至少需要2个字符')
    }
    
    if (!validateEmail(userData.email)) {
      throw new Error('请输入有效的邮箱地址')
    }
    
    if (!validatePassword(userData.password)) {
      throw new Error('密码至少需要6个字符')
    }
    
    if (userData.password !== userData.confirmPassword) {
      throw new Error('两次输入的密码不一致')
    }
    
    // 调用API
    const response = await apiClient.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password
    })
    
    const user = response.data
    
    // 保存用户信息到本地存储
    await saveToDB('user', user)
    
    return user
  } catch (error) {
    // 处理已知错误类型
    if (error.response) {
      const { status, data } = error.response
      
      if (status === 409) {
        throw new Error('该邮箱已被注册')
      }
      
      if (data && data.message) {
        throw new Error(data.message)
      }
    }
    
    // 处理其他错误
    throw new Error(error.message || '注册失败，请稍后再试')
  }
}

// 用户登录
export const login = async (credentials) => {
  try {
    // 基本验证
    if (!validateEmail(credentials.email)) {
      throw new Error('请输入有效的邮箱地址')
    }
    
    if (!credentials.password) {
      throw new Error('请输入密码')
    }
    
    // 调用API
    const response = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password
    })
    
    const user = response.data
    
    // 保存用户信息到本地存储
    await saveToDB('user', user)
    
    // 初始化用户数据
    await initializeUserData(user.id)
    
    return user
  } catch (error) {
    // 处理已知错误类型
    if (error.response) {
      const { status } = error.response
      
      if (status === 401) {
        throw new Error('邮箱或密码错误')
      }
      
      if (status === 404) {
        throw new Error('用户不存在')
      }
    }
    
    // 处理其他错误
    throw new Error(error.message || '登录失败，请稍后再试')
  }
}

// 用户登出
export const logout = async () => {
  try {
    // 调用API
    await apiClient.post('/auth/logout')
    
    // 清除本地存储的用户数据
    await saveToDB('user', null)
    
    return true
  } catch (error) {
    console.error('登出失败:', error)
    throw new Error('登出失败')
  }
}

// 获取当前用户信息
export const getCurrentUser = async () => {
  try {
    // 先尝试从本地存储获取
    const cachedUser = await getFromDB('user')
    if (cachedUser) {
      return cachedUser
    }
    
    // 如果本地没有，从API获取
    const response = await apiClient.get('/auth/me')
    const user = response.data
    
    // 保存到本地存储
    await saveToDB('user', user)
    
    return user
  } catch (error) {
    // 如果未认证，返回null
    if (error.response && error.response.status === 401) {
      return null
    }
    
    throw new Error('获取用户信息失败')
  }
}

// 初始化用户数据
const initializeUserData = async (userId) => {
  try {
    // 检查本地是否有数据
    const hasLocalData = await checkLocalDataExists()
    
    if (!hasLocalData) {
      // 如果没有本地数据，从服务器获取初始数据
      const [events, contacts] = await Promise.all([
        apiClient.get(`/users/${userId}/events`),
        apiClient.get(`/users/${userId}/contacts`)
      ])
      
      // 保存到本地数据库
      await Promise.all([
        saveToDB('events', events.data),
        saveToDB('contacts', contacts.data)
      ])
    }
  } catch (error) {
    console.error('初始化用户数据失败:', error)
    // 这里失败不影响主要功能，可以继续
  }
}

// 检查本地数据是否存在
const checkLocalDataExists = async () => {
  try {
    const [events, contacts] = await Promise.all([
      getFromDB('events'),
      getFromDB('contacts')
    ])
    
    return events && events.length > 0 && contacts && contacts.length > 0
  } catch (error) {
    return false
  }
}

// 更新用户信息
export const updateProfile = async (userData) => {
  try {
    // 基本验证
    if (!userData.name || userData.name.trim().length < 2) {
      throw new Error('用户名至少需要2个字符')
    }
    
    // 调用API
    const response = await apiClient.put('/auth/profile', userData)
    const updatedUser = response.data
    
    // 更新本地存储
    await saveToDB('user', updatedUser)
    
    return updatedUser
  } catch (error) {
    throw new Error(error.message || '更新个人信息失败')
  }
}

// 修改密码
export const changePassword = async (passwordData) => {
  try {
    // 验证
    if (!passwordData.currentPassword) {
      throw new Error('请输入当前密码')
    }
    
    if (!validatePassword(passwordData.newPassword)) {
      throw new Error('新密码至少需要6个字符')
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('两次输入的新密码不一致')
    }
    
    // 调用API
    await apiClient.put('/auth/password', {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    
    return true
  } catch (error) {
    // 处理已知错误
    if (error.response) {
      const { status } = error.response
      
      if (status === 401) {
        throw new Error('当前密码不正确')
      }
    }
    
    throw new Error(error.message || '修改密码失败')
  }
}

// 创建 authService 对象并默认导出
const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  changePassword
};

export default authService;