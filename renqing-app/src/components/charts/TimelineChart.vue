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

const chart = ref(null)
const data = ref([])
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
  
  const now = new Date();
  const days = parseInt(timeRange.value);
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
  const startTime = startDate.getTime();
  
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

// 初始化 ECharts 实例
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
        trigger: 'item',
        formatter: function(params) {
          const event = params.data;
          return `
            <div style="padding: 5px;">
              <strong>${event.name}</strong><br/>
              ${event.typeText}: ¥${Math.abs(event.amount)}<br/>
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
          formatter: function (value) {
            // 将时间戳转换为 MM-DD 格式
            return echarts.format.formatTime('MM-dd', value);
          },
          rotate: 45,
          margin: 20,
          align: 'center',
          verticalAlign: 'middle'
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
          formatter: function (value) {
            // 显示绝对值，因为负值已经在数据中处理
            return '¥' + Math.abs(value);
          }
        }
      },
      series: [
        {
          name: '送礼',
          type: 'scatter',
          data: filteredData.value.filter(d => d.type === 'given').map(d => ({
            ...d,
            // 对于散点图，x轴为时间戳，y轴为金额
            value: [d.time, d.amount]
          })),
          itemStyle: {
            color: '#ff6384'
          },
          symbolSize: function(data) {
            // 根据金额大小调整点的大小
            return Math.log(Math.abs(data[1]) + 1) * 3 + 5;
          }
        },
        {
          name: '收礼',
          type: 'scatter',
          data: filteredData.value.filter(d => d.type === 'received').map(d => ({
            ...d,
            // 对于散点图，x轴为时间戳，y轴为金额
            value: [d.time, d.amount]
          })),
          itemStyle: {
            color: '#36a2eb'
          },
          symbolSize: function(data) {
            // 根据金额大小调整点的大小
            return Math.log(Math.abs(data[1]) + 1) * 3 + 5;
          }
        }
      ]
    }
    
    chart.value.setOption(option)
  } catch (error) {
    console.error('ECharts initialization error:', error)
  }
}

// 监听事件数据变化
watch(
  () => props.events,
  (newEvents) => {
    if (!newEvents || !Array.isArray(newEvents)) return

    // 修复数据处理逻辑，确保正确映射事件数据
    data.value = newEvents.map(event => {
      const typeText = event.type === 'given' ? '送礼' : event.type === 'received' ? '收礼' : '其他'
      return {
        ...event,
        // 确保正确解析日期和金额字段
        time: event.date ? new Date(event.date).getTime() : Date.now(),
        // 对于送礼事件，将其金额设为负数以正确反映支出
        amount: event.type === 'given' ? -(event.amount || event.value || 0) : (event.amount || event.value || 0),
        name: event.title || event.name || event.description || '未知事件',
        typeText: typeText,
        type: event.type
      }
    })

    // 使用 nextTick 确保 DOM 更新后才初始化图表
    nextTick(() => {
      initChart()
    })
  },
  { immediate: true, deep: true }
)

// 监听时间范围变化
watch(timeRange, () => {
  initChart()
})

// 组件挂载时初始化
onMounted(() => {
  // 使用 nextTick 确保 DOM 渲染完成后再初始化图表
  nextTick(() => {
    initChart()
  })
  
  window.addEventListener('resize', () => {
    if (chart.value) {
      chart.value.resize()
    }
  })
})

// 组件卸载前清理
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