<template>
  <div class="dashboard-view">
    <div class="page-header">
      <h1>仪表盘</h1>
      <p>您的人情往来概览</p>
    </div>

    <div class="summary-cards grid-3">
      <div class="card">
        <div class="card-header">
          <h3>总人情值</h3>
          <i class="icon-scale"></i>
        </div>
        <div class="card-value" :class="balanceClass">
          {{ formattedBalance }}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>待还人情</h3>
          <i class="icon-gift"></i>
        </div>
        <div class="card-value negative">
          {{ formatCurrency(totalOwed) }}
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>待收人情</h3>
          <i class="icon-hand-coin"></i>
        </div>
        <div class="card-value positive">
          {{ formatCurrency(totalDue) }}
        </div>
      </div>
    </div>

    <div class="grid-2 mt-3">
      <div class="card">
        <BalanceChart :data="balanceData" />
      </div>
      <div class="card">
        <TimelineChart :events="recentEvents" />
      </div>
    </div>

    <div class="card mt-3">
      <div class="card-header flex-between">
        <h3>最近事件</h3>
        <router-link to="/events" class="btn btn-text">
          查看全部 <i class="icon-arrow-right"></i>
        </router-link>
      </div>
      <EventList :events="recentEvents" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useEventStore } from '@/stores/event.store'
import { formatCurrency } from '@/utils/currency'
import BalanceChart from '@/components/charts/BalanceChart.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'
import EventList from '@/components/events/EventList.vue'
import { nextTick } from 'vue' // ✅ 添加缺失的导入

const eventStore = useEventStore()

// 页面加载时获取事件数据
onMounted(async () => {
  await eventStore.loadEvents()
})

// 计算属性，用于响应事件数据变化
const balanceData = computed(() => {
  return {
    given: eventStore.totalGiven,
    received: eventStore.totalReceived
  }
})

const totalBalance = computed(() => eventStore.totalBalance)
const totalOwed = computed(() => eventStore.totalReceived)
const totalDue = computed(() => eventStore.totalGiven)

const formattedBalance = computed(() => {
  const balance = totalBalance.value
  if (balance === 0) return formatCurrency(0)
  
  return (balance > 0 ? '+' : '') + formatCurrency(balance)
})

const balanceClass = computed(() => {
  const balance = totalBalance.value
  if (balance > 0) return 'positive'
  if (balance < 0) return 'negative'
  return 'neutral'
})

// ✅ 修复：添加对事件变化的监听
watch(
  () => eventStore.events,
  async (newEvents) => {
    console.log('Events updated in DashboardView')
    // 确保所有相关组件都能接收到更新
    if (newEvents && newEvents.length > 0) {
      // 触发重新渲染
      await nextTick()
    }
  },
  { deep: true }
)
</script>

<style scoped>
.dashboard-view {
  padding-bottom: 2rem;
}

.summary-cards {
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--gray);
  margin: 0;
}

.card-header i {
  font-size: 1.5rem;
  color: var(--primary);
}

.card-value {
  font-size: 1.8rem;
  font-weight: 700;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>