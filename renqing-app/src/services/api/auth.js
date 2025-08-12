// Auth service
export default {
  login(credentials) {
    // 登录逻辑示例
    console.log('Logging in with:', credentials)
    return new Promise((resolve, reject) => {
      // 模拟登录请求
      setTimeout(() => {
        if (credentials.username === 'admin' && credentials.password === 'password') {
          resolve({ token: 'mock-token' })
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  },
  logout() {
    // 注销逻辑
    console.log('Logging out')
    // 清除token等操作
  }
}

export const isAuthenticated = () => {
  // 验证是否已登录
  // 示例：检查是否存在token
  return !!localStorage.getItem('token')
}