<template>
  <div class="loading-container">
    <div class="loader"></div>
    <p>应用初始化中...</p>
    <p v-if="initializationProgress">{{ initializationProgress }}</p>
    <button @click="handleSkip" class="skip-button">跳过初始化</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const initializationProgress = ref('正在加载用户数据...')
let checkInterval = null

onMounted(() => {
  console.log('[LOADING] Loading view mounted')
  
  // 每0.5秒检查一次初始化状态
  checkInterval = setInterval(() => {
    console.log('[LOADING] Checking initialization status')
    
    if (authStore.initializationStep) {
      initializationProgress.value = authStore.initializationStep
    }
    
    // 如果初始化完成，跳转到目标页面
    if (authStore.isInitialized && !authStore.initializing) {
      clearInterval(checkInterval)
      redirectToTarget()
    }
  }, 500)
  
  // 如果已经初始化完成，直接跳转
  if (authStore.isInitialized && !authStore.initializing) {
    redirectToTarget()
    return
  }
  
  // 设置超时，防止无限等待
  setTimeout(() => {
    if (checkInterval) {
      clearInterval(checkInterval)
      console.log('[LOADING] Initialization timeout')
      // 强制标记为已初始化
      authStore.setInitializing(false)
      authStore.setInitialized(true)
      redirectToTarget()
    }
  }, 10000) // 10秒超时
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})

function redirectToTarget() {
  const redirectPath = localStorage.getItem('redirectPath') || '/'
  console.log(`[LOADING] Redirecting to: ${redirectPath}`)
  
  // 清除重定向路径
  localStorage.removeItem('redirectPath')
  
  // 跳转到目标页面
  router.push(redirectPath).catch(err => {
    console.error('[LOADING] Navigation error:', err)
    // 如果导航失败，跳转到首页
    router.push('/')
  })
}

function handleSkip() {
  console.log('[LOADING] Skipping initialization')
  if (checkInterval) {
    clearInterval(checkInterval)
  }
  // 强制标记为已初始化
  authStore.setInitializing(false)
  authStore.setInitialized(true)
  redirectToTarget()
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fb;
}

.loader {
  border: 4px solid rgba(67, 97, 238, 0.2);
  border-radius: 50%;
  border-top: 4px solid #4361ee;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

p {
  color: #4361ee;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 10px 0;
}

.skip-button {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.skip-button:hover {
  background-color: #3a56e0;
}
</style>