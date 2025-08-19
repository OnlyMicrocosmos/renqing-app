<template>
  <div class="analysis-view">
    <div class="page-header">
      <h1>数据分析</h1>
      <p>深入了解您的人情往来情况</p>
    </div>

    <div class="card mt-3">
      <div class="card-header flex-between">
        <h3>人情收支平衡</h3>
        <div class="time-filter">
          <select v-model="balanceTimeRange" class="time-select">
            <option value="all">全部时间</option>
            <option value="year">今年</option>
            <option value="quarter">本季度</option>
            <option value="month">本月</option>
          </select>
        </div>
      </div>
      <BalanceChart :data="balanceData" />
    </div>

    <div class="card mt-3">
      <div class="card-header flex-between">
        <h3>人情事件时间线</h3>
        <div class="time-filter">
          <select v-model="timelineTimeRange" class="time-select">
            <option value="30">最近30天</option>
            <option value="90">最近90天</option>
            <option value="year">今年</option>
            <option value="all">全部时间</option>
          </select>
        </div>
      </div>
      <TimelineChart :events="filteredEvents" />
    </div>

    <div class="grid-2 mt-3">
      <div class="card">
        <div class="card-header">
          <h3>按类型统计</h3>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">送礼总额</div>
            <div class="stat-value negative">{{ formatCurrency(givenTotal) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">收礼总额</div>
            <div class="stat-value positive">{{ formatCurrency(receivedTotal) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">净收支</div>
            <div class="stat-value" :class="netBalanceClass">{{ formatCurrency(netBalance) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">事件总数</div>
            <div class="stat-value">{{ totalEvents }}</div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <h3>按关系统计</h3>
        </div>
        <div class="relation-stats">
          <div v-for="relation in relationStats" :key="relation.type" class="relation-item">
            <div class="relation-label">{{ relation.label }}</div>
            <div class="relation-value">{{ relation.count }} 项</div>
            <div class="relation-amount">{{ formatCurrency(relation.amount) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue' // ✅ 添加缺失的导入
import { useEventStore } from '@/stores/event.store'
import { formatCurrency } from '@/utils/currency'
import BalanceChart from '@/components/charts/BalanceChart.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'

const eventStore = useEventStore()
const balanceTimeRange = ref('all')
const timelineTimeRange = ref('30')

// 页面加载时获取事件数据
onMounted(async () => {
  await eventStore.loadEvents()
})

// ✅ 修复：添加对事件变化的监听
watch(
  () => eventStore.events,
  async (newEvents) => {
    console.log('Events updated in AnalysisView')
    // 确保所有相关组件都能接收到更新
    if (newEvents && newEvents.length > 0) {
      // 触发重新渲染
      await nextTick()
    }
  },
  { deep: true }
)

// 过滤事件
const filteredEvents = computed(() => {
  const now = new Date()
  let startDate = new Date(0) // 默认从最早开始
  let endDate = new Date() // 默认到当前
  
  switch (timelineTimeRange.value) {
    case '30':
      startDate = new Date(now.setDate(now.getDate() - 30))
      break
    case '90':
      startDate = new Date(now.setDate(now.getDate() - 90))
      break
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
  }
  
  return eventStore.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= startDate && eventDate <= endDate
  })
})

// 平衡数据
const balanceData = computed(() => {
  let given = 0
  let received = 0
  
  const now = new Date()
  let startDate = new Date(0)
  
  switch (balanceTimeRange.value) {
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = new Date(now.getFullYear(), quarter * 3, 1)
      break
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
  }
  
  eventStore.events.forEach(event => {
    const eventDate = new Date(event.date)
    if (eventDate >= startDate) {
      if (event.type === 'given') {
        given += event.value
      } else {
        received += event.value
      }
    }
  })
  
  return { given, received }
})

</script>

<style scoped>
.analysis-view {
  padding-bottom: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray);
  margin: 0;
}

.time-filter {
  display: flex;
  gap: 0.5rem;
}

.time-select {
  padding: 0.5rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
  font-size: 0.875rem;
  color: var(--dark);
  outline: none;
  transition: var(--transition);
}

.time-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem;
}

.stat-item {
  padding: 1rem;
  border-radius: var(--border-radius);
  background-color: var(--light);
  text-align: center;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-value.positive {
  color: var(--success);
}

.stat-value.negative {
  color: var(--danger);
}

.relation-stats {
  padding: 1rem;
}

.relation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--light-gray);
}

.relation-item:last-child {
  border-bottom: none;
}

.relation-label {
  flex: 1;
  font-weight: 500;
}

.relation-value {
  width: 60px;
  text-align: center;
  color: var(--gray);
}

.relation-amount {
  width: 100px;
  text-align: right;
  font-weight: 600;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .relation-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .relation-value,
  .relation-amount {
    width: auto;
    text-align: left;
  }
}
</style>