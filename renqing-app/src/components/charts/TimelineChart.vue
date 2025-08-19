<template>
  <div class="timeline-chart">
    <div class="chart-header">
      <h3>人情事件时间线</h3>
      <div class="chart-actions">
        <select v-model="timeRange" class="time-select">
          <option value="7">最近7天</option>
          <option value="30">最近30天</option>
          <option value="90">最近90天</option>
          <option value="all">全部时间</option>
        </select>
      </div>
    </div>
    <div v-if="hasData" ref="chartEl" class="chart-container"></div>
    <div v-else class="chart-empty">
      <p>暂无数据</p>
      <p class="chart-empty-subtitle">还没有人情往来记录</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useEventStore } from '@/stores/event.store' // ✅ 添加缺失的导入

const chart = ref(null)
const data = ref([]) // 初始化为空数组，避免 undefined
const chartEl = ref(null)

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const hasData = computed(() => {
  return filteredData.value && filteredData.value.length > 0
})

const timeRange = ref('30')

const filteredData = computed(() => {
  if (timeRange.value === 'all') {
    return data.value;
  }
  
  const now = new Date().getTime();
  const days = parseInt(timeRange.value);
  const startTime = now - (days * 24 * 60 * 60 * 1000);
  
  return data.value.filter(item => item.time >= startTime);
});

const color = (type) => {
  switch (type) {
    case 'given':
      return '#ff6384'
    case 'received':
      return '#36a2eb'
    default:
      return '#ccc'
  }
}

// ✅ 修复：定义 initChart 函数并初始化 ECharts 实例
const initChart = () => {
  if (!chartEl.value || !hasData.value) return
  
  try {
    // 销毁现有图表实例
    if (chart.value) {
      chart.value.dispose()
    }
    
    // 创建新的 ECharts 实例
    chart.value = echarts.init(chartEl.value)
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const event = params[0].data
          return `
            <div style="padding: 5px;">
              <strong>${event.name}</strong><br/>
              ${event.typeText}: ¥${event.amount}<br/>
              日期: ${new Date(event.time).toLocaleDateString()}
            </div>
          `
        }
      },
      xAxis: {
        type: 'time',
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: '{yyyy}-{MM}-{dd}'
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          show: true,
          lineStyle: {
            color: '#eee'
          }
        },
        axisLabel: {
          formatter: '{value}¥'
        }
      },
      series: [
        {
          name: '送礼',
          type: 'line',
          data: filteredData.value.filter(d => d.type === 'given').map(d => ({
            ...d,
            value: d.amount
          })),
          lineStyle: {
            color: '#ff6384'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(255, 99, 132, 0.3)' },
              { offset: 1, color: 'rgba(255, 99, 132, 0)' }
            ])
          }
        },
        {
          name: '收礼',
          type: 'line',
          data: filteredData.value.filter(d => d.type === 'received').map(d => ({
            ...d,
            value: d.amount
          })),
          lineStyle: {
            color: '#36a2eb'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(54, 162, 235, 0.3)' },
              { offset: 1, color: 'rgba(54, 162, 235, 0)' }
            ])
          }
        }
      ]
    }
    
    chart.value.setOption(option)
  } catch (error) {
    console.error('ECharts initialization error:', error)
  }
}

// ✅ 修复：确保在数据变化时重新初始化图表
watch(
  () => props.events,
  (newEvents) => {
    if (!newEvents || !Array.isArray(newEvents)) return

    data.value = newEvents.map(event => {
      const typeText = event.type === 'given' ? '送礼' : event.type === 'received' ? '收礼' : '其他'
      return {
        ...event,
        time: event.date ? new Date(event.date).getTime() : Date.now(),
        amount: event.value || 0,
        name: event.title || event.name || '未知事件',
        typeText: typeText
      }
    })

    // ✅ 使用 nextTick 确保 DOM 更新后才初始化图表
    nextTick(() => {
      initChart()
    })
  },
  { immediate: true }
)

watch(timeRange, () => {
  initChart()
})

// ✅ 修复：确保在组件挂载时获取最新数据
onMounted(() => {
  // 确保在组件挂载时获取最新的事件数据
  if (props.events.length === 0) {
    // 如果传入的事件为空，尝试从 store 获取
    const eventStore = useEventStore()
    data.value = eventStore.events.map(event => {
      const typeText = event.type === 'given' ? '送礼' : event.type === 'received' ? '收礼' : '其他'
      return {
        ...event,
        time: event.date ? new Date(event.date).getTime() : Date.now(),
        amount: event.value || 0,
        name: event.title || event.name || '未知事件',
        typeText: typeText
      }
    })
  }
  
  // ✅ 使用 nextTick 确保 DOM 渲染完成后再初始化图表
  nextTick(() => {
    initChart()
  })
  
  window.addEventListener('resize', () => {
    if (chart.value) {
      chart.value.resize()
    }
  })
})

onBeforeUnmount(() => {
  if (chart.value) {
    try {
      chart.value.dispose()
    } catch (e) {
      console.warn('ECharts dispose error on unmount:', e)
    }
  }
})
</script>

<style scoped>
.timeline-chart {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark);
  margin: 0;
}

.chart-actions {
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

.chart-container {
  flex: 1;
  min-height: 300px;
}

.chart-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: var(--gray);
}

.chart-empty p {
  margin: 0;
}

.chart-empty-subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .chart-actions {
    align-self: flex-end;
  }
  
  .timeline-chart {
    padding: 1rem;
  }
}
</style>