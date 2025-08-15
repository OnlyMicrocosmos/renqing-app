import axios from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { getFromDB } from './storage/indexedDB'

// 模拟apiClient，使用本地存储而不是远程API
const apiClient = {
  post: async (url, data) => {
    // 模拟登录
    if (url === '/auth/login') {
      // 增强健壮性，确保data对象存在
      if (!data) {
        throw new Error('登录数据不能为空');
      }
      
      const { email, username, password } = data;
      
      // 检查必要字段
      if (!password) {
        throw new Error('请输入密码');
      }
      
      // 确定登录字段，优先使用username，如果没有则使用email
      const loginValue = username || email;
      
      if (!loginValue) {
        throw new Error('请输入用户名或邮箱');
      }
      
      // 从本地存储获取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 先尝试通过用户名查找
      let user = users.find(u => u.name === loginValue && u.password === password);
      
      // 如果没找到，再尝试通过邮箱查找
      if (!user) {
        user = users.find(u => u.email === loginValue && u.password === password);
      }
      
      if (user) {
        return {
          data: {
            user: {
              id: user.id,
              name: user.name,
              email: user.email
            },
            accessToken: 'mock-token-' + user.id,
            refreshToken: 'mock-refresh-token-' + user.id
          }
        };
      } else {
        throw new Error('用户名或密码错误');
      }
    }
    
    // 模拟注册
    if (url === '/auth/register') {
      // 增强健壮性，确保data对象存在
      if (!data) {
        throw new Error('注册数据不能为空');
      }
      
      const { name, email, password } = data;
      
      // 检查必要字段
      if (!name) {
        throw new Error('请输入用户名');
      }
      
      if (!email) {
        throw new Error('请输入邮箱');
      }
      
      if (!password) {
        throw new Error('请输入密码');
      }
      
      // 从本地存储获取用户数据
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // 检查邮箱是否已存在
      if (users.some(u => u.email === email)) {
        throw new Error('该邮箱已被注册');
      }
      
      // 检查用户名是否已存在
      if (users.some(u => u.name === name)) {
        throw new Error('该用户名已被注册');
      }
      
      // 创建新用户
      const newUser = {
        id: Date.now(),
        name,
        email,
        password // 实际项目中应该加密密码
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      return {
        data: {
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
          },
          accessToken: 'mock-token-' + newUser.id,
          refreshToken: 'mock-refresh-token-' + newUser.id
        }
      };
    }
    
    // 其他请求
    return { data: {} };
  },
  
  get: async (url) => {
    // 模拟获取用户信息
    if (url === '/auth/me') {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) {
        return { data: user };
      } else {
        throw new Error('未认证');
      }
    }
    
    // 其他请求
    return { data: {} };
  },
  
  put: async (url, data) => {
    // 模拟更新用户信息
    return { data: {} };
  }
};

export default apiClient
