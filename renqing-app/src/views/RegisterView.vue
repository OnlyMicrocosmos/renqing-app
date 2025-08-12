<template>
  <div class="register-view">
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <RQInput v-model="user.username" placeholder="Username" />
      <RQInput v-model="user.password" type="password" placeholder="Password" />
      <RQButton type="submit">Register</RQButton>
    </form>
  </div>
</template>

<script>
import RQInput from '../components/ui/RQInput.vue'
import RQButton from '../components/ui/RQButton.vue'

export default {
  name: 'RegisterView',
  components: {
    RQInput,
    RQButton
  },
  data() {
    return {
      user: {
        username: '',
        password: ''
      }
    }
  },
  methods: {
    async handleRegister() {
      // Register logic here
      console.log('Registering user:', this.user)
    }
  }
}
</script>

<style scoped>
/* styles */
</style>