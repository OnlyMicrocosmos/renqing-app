<template>
  <div class="app-container">
    <header class="app-header">
      <div class="container flex-between">
        <router-link to="/" class="logo">人情账本</router-link>
        <nav v-if="isAuthenticated" class="nav-menu">
          <router-link to="/">仪表盘</router-link>
          <router-link to="/events">事件</router-link>
          <router-link to="/contacts">联系人</router-link>
          <router-link to="/analysis">分析</router-link>
          <router-link to="/settings">设置</router-link>
        </nav>
        <div class="user-actions">
          <template v-if="isAuthenticated">
            <span class="username">{{ username }}</span>
            <button @click="logout" class="btn btn-outline">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn btn-outline">登录</router-link>
            <router-link to="/register" class="btn">注册</router-link>
          </template>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>
    
    <footer class="app-footer">
      <div class="container">
        <p>© 2023 人情账本 - 记录每一次人情往来</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const username = computed(() => authStore.username)

const logout = () => {
  authStore.logout()
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 15px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
  margin-left: 30px;
}

.nav-menu a {
  text-decoration: none;
  color: var(--dark);
  font-weight: 500;
  padding: 5px 0;
  position: relative;
}

.nav-menu a.router-link-exact-active {
  color: var(--primary);
}

.nav-menu a.router-link-exact-active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--primary);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.username {
  font-weight: 500;
  color: var(--dark);
}

.app-main {
  flex: 1;
  padding: 30px 0;
}

.app-footer {
  background-color: white;
  padding: 20px 0;
  border-top: 1px solid var(--light-gray);
  text-align: center;
  color: var(--gray);
  font-size: 0.9rem;
}
</style>