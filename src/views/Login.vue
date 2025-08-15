<template>
  <div class="login-container">
    <h2>欢迎回来</h2>
    <p>登录您的账户以继续</p>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名或邮箱</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="请输入用户名或邮箱"
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          required
        />
      </div>
      
      <div class="remember-me">
        <label>
          <input type="checkbox" v-model="rememberMe" /> 记住我
        </label>
        <a href="#" @click.prevent="forgotPassword">忘记密码？</a>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <button type="submit" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </form>
    
    <div class="register-link">
      还没有账户？<a href="#" @click.prevent="goToRegister">立即注册</a>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'Login',
  setup() {
    const username = ref('');
    const password = ref('');
    const rememberMe = ref(false);
    const loading = ref(false);
    const error = ref('');

    const authStore = useAuthStore();

    const handleLogin = async () => {
      try {
        loading.value = true;
        error.value = '';
        
        // 调用登录方法
        await authStore.login({
          username: username.value,
          password: password.value
        });
        
        // 登录成功后跳转到首页
        // router.push('/dashboard');
      } catch (err) {
        error.value = err.message || '登录失败，请重试';
      } finally {
        loading.value = false;
      }
    };

    const forgotPassword = () => {
      // 忘记密码逻辑
    };

    const goToRegister = () => {
      // 跳转到注册页面
    };

    return {
      username,
      password,
      rememberMe,
      loading,
      error,
      handleLogin,
      forgotPassword,
      goToRegister
    };
  }
};
</script>

<style scoped>
/* ... existing styles ... */
</style>