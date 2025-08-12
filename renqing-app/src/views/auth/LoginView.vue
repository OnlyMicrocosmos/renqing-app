<template>
  <div class="login-view">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <RQInput v-model="credentials.username" placeholder="Username" />
      <RQInput v-model="credentials.password" type="password" placeholder="Password" />
      <RQButton type="submit">Login</RQButton>
    </form>
  </div>
</template>

<script>
import RQInput from '../components/ui/RQInput.vue'
import RQButton from '../components/ui/RQButton.vue'
import { login } from '../services/auth'

export default {
  name: 'LoginView',
  components: {
    RQInput,
    RQButton
  },
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleLogin() {
      try {
        const response = await login(this.credentials)
        // Handle successful login (e.g., store token, navigate to dashboard)
        console.log('Login successful:', response)
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }
}
</script>

<style scoped>
/* styles */
</style>