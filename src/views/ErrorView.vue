<template>
  <div class="error-container">
    <h1>{{ errorTitle }}</h1>
    <p>{{ errorMessage }}</p>
    <pre v-if="errorDetails">{{ errorDetails }}</pre>
    <button @click="goHome">返回首页</button>
    <button @click="reload">刷新页面</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const errorTitle = ref('发生错误')
const errorMessage = ref('应用遇到问题')
const errorDetails = ref('')

onMounted(() => {
  const query = router.currentRoute.value.query
  if (query.message) errorMessage.value = query.message
  if (query.error) errorDetails.value = query.error
})

function goHome() {
  router.push('/')
}

function reload() {
  window.location.reload()
}
</script>