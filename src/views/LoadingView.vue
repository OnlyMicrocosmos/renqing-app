<template>
  <div class="loading-container">
    <div class="loader"></div>
    <p>应用初始化中...</p>
    <p v-if="initializationProgress">{{ initializationProgress }}</p>
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
    
    if (authStore.isInitialized) {
      clearInterval(checkInterval)
      redirectToTarget()
    }
  }, 500)
  
  // 如果已经初始化完成，直接跳转
  if (authStore.isInitialized) {
    redirectToTarget()
    return
  }
})

onUnmounted(() => {
  if (checkInterval) {
    clearInterval(checkInterval)
  }
})

function redirectToTarget() {
  const redirectPath = localStorage.getItem('redirectPath') || '/'
  console.log(`[LOADING] Redirecting to: ${redirectPath}`)
  localStorage.removeItem('redirectPath')
  router.replace(redirectPath)
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fb;
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
  margin: 5px 0;
}
</style>