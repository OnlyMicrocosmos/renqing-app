<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <h1>欢迎回来</h1>
        <p>登录您的账户以继续</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="username">用户名或邮箱</label>
          <input 
            id="username"
            v-model="credentials.username" 
            type="text" 
            placeholder="请输入用户名或邮箱" 
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

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
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
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const rememberMe = ref(false)
const errorMessage = ref('')

const credentials = reactive({
  username: '',
  password: ''
})

onMounted(() => {
  // 检查是否有记住的用户名
  const rememberedUsername = localStorage.getItem('remembered-username')
  if (rememberedUsername) {
    credentials.username = rememberedUsername
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!credentials.username || !credentials.password) {
    errorMessage.value = '请输入用户名/邮箱和密码'
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  try {
    // 调用认证存储的登录方法
    await authStore.login({
      username: credentials.username,
      password: credentials.password
    })
    
    // 如果选择了记住我，保存用户名
    if (rememberMe.value) {
      localStorage.setItem('remembered-username', credentials.username)
    } else {
      localStorage.removeItem('remembered-username')
    }
    
    // 跳转到仪表盘
    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = error.message || '登录失败: 用户名或密码错误'
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
  background: linear-gradient(135deg, #4361ee 0%, #3f37c9 100%);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  padding: 2.5rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h1 {
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2b2d42;
}

.auth-header p {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
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
  color: #2b2d42;
  font-size: 0.95rem;
}

.form-control {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.checkbox-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.8rem;
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
  font-size: 0.9rem;
  color: #495057;
}

.checkbox-label input {
  margin-right: 0.5rem;
}

.forgot-password {
  color: #4361ee;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.forgot-password:hover {
  text-decoration: underline;
  color: #3a56d4;
}

.btn {
  display: inline-block;
  font-weight: 500;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid transparent;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-primary {
  color: #fff;
  background-color: #4361ee;
  border-color: #4361ee;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3a56e4;
  border-color: #3a56e4;
}

.btn-primary:disabled {
  background-color: #a9b9f7;
  border-color: #a9b9f7;
  cursor: not-allowed;
}

.btn-block {
  display: block;
  width: 100%;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.auth-footer {
  text-align: center;
  color: #6c757d;
  font-size: 0.95rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.auth-footer a {
  color: #4361ee;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.auth-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .auth-container {
    padding: 1.8rem;
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