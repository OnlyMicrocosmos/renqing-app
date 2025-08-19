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
  background: linear-gradient(to bottom, #f1f4f9, #dff1ff);
  overflow: hidden;
  position: relative;
}

.auth-view::before,
.auth-view::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(150px);
}

.auth-view::before {
  width: 600px;
  height: 600px;
  background: #ff359b;
  top: -350px;
  left: 0;
}

.auth-view::after {
  width: 500px;
  height: 500px;
  background: #00d2ff;
  bottom: -150px;
  right: 100px;
}

.auth-container {
  position: relative;
  width: 100%;
  max-width: 400px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  padding: 2.5rem;
  animation: fadeIn 0.5s ease;
  z-index: 10;
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
  position: relative;
  margin-bottom: 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
  color: #fff;
}

.auth-header h1::after {
  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -10px;
  width: 80px;
  height: 4px;
  background: #fff;
}

.auth-header p {
  color: #fff;
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
  padding: 0.85rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 35px;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
  color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.form-control::placeholder {
  color: #fff;
}

.form-control:focus {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
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
  color: #666;
  background: #fff;
  border-color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #f1f1f1;
  border-color: #f1f1f1;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-block {
  display: block;
  width: 100%;
}

.error-message {
  color: #ff7878;
  text-align: center;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  background: transparent;
  border: 1px solid #ff7878;
}

.auth-footer {
  text-align: center;
  color: #fff;
  font-size: 0.95rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.auth-footer a {
  color: #fff;
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