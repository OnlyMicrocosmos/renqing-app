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
    // 实际调用注册服务
    const { useAuthStore } = await import('@/stores/auth.store')
    const authStore = useAuthStore()
    
    // 调用注册方法
    await authStore.register({
      username: user.username,
      email: user.email,
      password: user.password,
      confirmPassword: confirmPassword.value
    })
    
    // 注册成功后先跳转到登录页面
    router.push('/login')
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
  padding: 2rem;
  z-index: 10;
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
  color: #fff;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 35px;
  font-size: 1rem;
  outline: none;
  transition: var(--transition);
  box-sizing: border-box;
  color: #fff;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.form-control::placeholder {
  color: #fff;
}

.form-control:focus {
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
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
  color: #fff;
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
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin-right: 0.5rem;
  position: relative;
  flex-shrink: 0;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: #fff;
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
  border: solid #666;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-link {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
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
  color: #fff;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.auth-footer a {
  color: #fff;
  text-decoration: none;
  font-weight: 600;
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