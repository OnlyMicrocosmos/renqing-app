<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录您的账户以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username"
            v-model="credentials.username" 
            type="text" 
            placeholder="请输入用户名" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="credentials.password" 
            type="password" 
            placeholder="请输入密码" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="rememberMe"
            />
            <span class="checkmark"></span>
            记住我
          </label>
          <a href="#" class="forgot-password">忘记密码？</a>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading">登录中...</span>
          <span v-else>登录</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>还没有账户？ <router-link to="/register">立即注册</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const rememberMe = ref(false)

const credentials = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!credentials.username || !credentials.password) {
    alert('请输入用户名和密码')
    return
  }

  loading.value = true
  
  try {
    // 模拟登录过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟登录成功
    localStorage.setItem('user-token', 'fake-jwt-token')
    
    // 如果选择了记住我，保存用户名
    if (rememberMe.value) {
      localStorage.setItem('remembered-username', credentials.username)
    } else {
      localStorage.removeItem('remembered-username')
    }
    
    // 跳转到仪表盘
    router.push('/dashboard')
  } catch (error) {
    alert('登录失败: ' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background-color: #f8f9fa;
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--dark);
}

.auth-header p {
  color: var(--gray);
  margin: 0;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--dark);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  outline: none;
  transition: var(--transition);
  box-sizing: border-box;
}

.form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  user-select: none;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  height: 16px;
  width: 16px;
  background-color: #eee;
  border-radius: 3px;
  margin-right: 0.5rem;
  position: relative;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: var(--primary);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-label .checkmark:after {
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-password {
  color: var(--primary);
  text-decoration: none;
  font-size: 0.875rem;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-block {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  color: var(--gray);
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .auth-container {
    padding: 1.5rem;
  }
  
  .auth-header h1 {
    font-size: 1.5rem;
  }
  
  .checkbox-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>