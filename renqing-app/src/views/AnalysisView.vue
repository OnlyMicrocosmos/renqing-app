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
      <BalanceChart :data="chartData" />
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
            <div class="stat-value negative">{{ formatCurrency(totalGiven) }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">收礼总额</div>
            <div class="stat-value positive">{{ formatCurrency(totalReceived) }}</div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useEventStore } from '@/stores/event.store'
import BalanceChart from '@/components/charts/BalanceChart.vue'
import TimelineChart from '@/components/charts/TimelineChart.vue'
import { formatCurrency } from '@/utils/currency'

// 从事件存储中获取数据
const eventStore = useEventStore()

// 时间范围过滤器
const balanceTimeRange = ref('all')
const timelineTimeRange = ref('30')

// 响应式数据：总收礼金额、总送礼金额
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

// 图表数据
const chartData = computed(() => ({
  received: totalReceived.value,
  given: totalGiven.value
}))

// 净收支
const netBalance = computed(() => totalReceived.value - totalGiven.value)

// 净收支样式类
const netBalanceClass = computed(() => {
  if (netBalance.value > 0) return 'positive'
  if (netBalance.value < 0) return 'negative'
  return ''
})

// 事件总数
const totalEvents = computed(() => eventStore.events.length)

// 按关系统计
const relationStats = computed(() => {
  const stats = {}
  eventStore.events.forEach(event => {
    const relation = event.contact?.relation || '未知'
    if (!stats[relation]) {
      stats[relation] = {
        label: relation,
        count: 0,
        amount: 0
      }
    }
    stats[relation].count++
    stats[relation].amount += event.amount || 0
  })
  
  return Object.values(stats)
})

// 过滤后的时间线事件
const filteredEvents = computed(() => {
  let events = [...eventStore.events]
  
  // 按时间过滤
  if (timelineTimeRange.value !== 'all') {
    const now = new Date()
    let startDate
    
    if (timelineTimeRange.value === '30') {
      startDate = new Date(now.setDate(now.getDate() - 30))
    } else if (timelineTimeRange.value === '90') {
      startDate = new Date(now.setDate(now.getDate() - 90))
    } else if (timelineTimeRange.value === 'year') {
      startDate = new Date(new Date().getFullYear(), 0, 1)
    }
    
    if (startDate) {
      events = events.filter(event => new Date(event.date) >= startDate)
    }
  }
  
  // 按日期排序
  return events.sort((a, b) => new Date(a.date) - new Date(b.date))
})

// 监听事件存储变化
watch(
  () => eventStore.events,
  () => {
    // 当事件发生变化时，组件会自动重新计算相关值
    console.log('Events updated, recalculating stats...')
  },
  { deep: true }
)

onMounted(() => {
  // 加载初始数据
  eventStore.loadEvents()
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

.card-header.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
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