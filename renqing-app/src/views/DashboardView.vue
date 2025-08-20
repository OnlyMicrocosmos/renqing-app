<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useEventStore } from '@/stores/event.store'
import { useContactStore } from '@/stores/contact.store'
import { useAuthStore } from '@/stores/auth.store'
import { nextTick } from 'vue'

// 引入图表组件
import BalanceChart from '@/components/charts/BalanceChart.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'

const eventStore = useEventStore()
const contactStore = useContactStore()
const authStore = useAuthStore()

// 加载事件数据
const loadEvents = async () => {
  await eventStore.loadEvents()
}

// 初始化数据
onMounted(async () => {
  await loadEvents()
  // 确保 DOM 渲染完成后再初始化图表
  await nextTick()
})

// 监听 events 变化，触发图表重绘
watch(
  () => eventStore.events,
  (newEvents) => {
    if (newEvents.length > 0) {
      // 触发图表更新逻辑（可由子组件内部处理）
      console.log('事件数据已更新:', newEvents)
    }
  },
  { deep: true }
)

// 计算总人情值
const totalReceived = computed(() => {
  return eventStore.events
    .filter(event => event.type === 'received')
    .reduce((sum, event) => sum + (event.amount || 0), 0)
})

const totalGiven = computed(() => {
  return eventStore.events
    .filter(event => event.type === 'given')
    .reduce((sum, event) => sum + (event.amount || 0), 0)
})

const totalBalance = computed(() => {
  return totalReceived.value - totalGiven.value
})

// 图表数据
const chartData = computed(() => ({
  received: totalReceived.value,
  given: totalGiven.value
}))

// 待还人情（送出但未收回）
const pendingToReturn = computed(() => {
  return eventStore.events
    .filter(event => event.type === 'given' && !event.isReturned)
    .reduce((sum, event) => sum + (event.amount || 0), 0)
})

// 待收人情（收到但未归还）
const pendingToReceive = computed(() => {
  return eventStore.events
    .filter(event => event.type === 'received' && !event.isReturned)
    .reduce((sum, event) => sum + (event.amount || 0), 0)
})

// 时间线图表数据过滤
const timelineTimeRange = ref('last30days')

const filteredEvents = computed(() => {
  const now = new Date()
  const cutoffDate = new Date(now)
  switch (timelineTimeRange.value) {
    case 'last30days':
      cutoffDate.setDate(now.getDate() - 30)
      break
    case 'last90days':
      cutoffDate.setDate(now.getDate() - 90)
      break
    case 'thisYear':
      cutoffDate.setFullYear(now.getFullYear() - 1)
      break
    default:
      return eventStore.events
  }
  
  return eventStore.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= cutoffDate
  })
})
</script>

<template>
  <div class="dashboard">
    <h1>仪表盘</h1>
    <p>您的人情往来概览</p>

    <!-- 概览卡片 -->
    <div class="cards">
      <div class="card">
        <h3>总人情值</h3>
        <p>¥{{ totalBalance }}</p>
      </div>
      <div class="card">
        <h3>待还人情</h3>
        <p>¥{{ pendingToReturn }}</p>
      </div>
      <div class="card">
        <h3>待收人情</h3>
        <p>¥{{ pendingToReceive }}</p>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts">
      <div class="chart-container">
        <h3>人情收支平衡</h3>
        <BalanceChart :data="chartData" />
      </div>
      <div class="chart-container">
        <h3>人情事件时间线</h3>
        <div class="time-range">
          <select v-model="timelineTimeRange">
            <option value="last30days">最近30天</option>
            <option value="last90days">最近90天</option>
            <option value="thisYear">今年</option>
          </select>
        </div>
        <TimelineChart :events="filteredEvents" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f7fa;
}
.cards {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
.card {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.chart-container {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}
.time-range {
  margin-bottom: 10px;
  text-align: right;
}
</style>