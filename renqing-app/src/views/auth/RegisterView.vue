<template>
  <div class="auth-view">
    <div class="auth-container">
      <div class="auth-header">
        <h1>创建账户</h1>
        <p>注册以开始记录您的人情往来</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            id="username"
            v-model="user.username" 
            type="text" 
            placeholder="请输入用户名" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            id="email"
            v-model="user.email" 
            type="email" 
            placeholder="请输入邮箱地址" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input 
            id="password"
            v-model="user.password" 
            type="password" 
            placeholder="请输入密码" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            id="confirmPassword"
            v-model="confirmPassword" 
            type="password" 
            placeholder="请再次输入密码" 
            class="form-control"
            required
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="agreeToTerms"
              required
            />
            <span class="checkmark"></span>
            我同意 <a href="#" class="terms-link">服务条款</a> 和 <a href="#" class="terms-link">隐私政策</a>
          </label>
        </div>

        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="loading"
        >
          <span v-if="loading">注册中...</span>
          <span v-else>注册</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>已有账户？ <router-link to="/login">立即登录</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const confirmPassword = ref('')
const agreeToTerms = ref(false)

const user = reactive({
  username: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  // 表单验证
  if (!user.username || !user.email || !user.password) {
    alert('请填写所有必填字段')
    return
  }

  if (user.password !== confirmPassword.value) {
    alert('两次输入的密码不一致')
    return
  }

  if (!agreeToTerms.value) {
    alert('请同意服务条款和隐私政策')
    return
  }

  loading.value = true
  
  try {
    // 模拟注册过程
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟注册成功
    localStorage.setItem('user-token', 'fake-jwt-token')
    
    // 跳转到仪表盘
    router.push('/dashboard')
  } catch (error) {
    alert('注册失败: ' + (error.message || '未知错误'))
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
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  user-select: none;
  line-height: 1.4;
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
  flex-shrink: 0;
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

.terms-link {
  color: var(--primary);
  text-decoration: none;
}

.terms-link:hover {
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
}
</style>