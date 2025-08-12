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
    <div ref="chartEl" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { format } from 'date-fns'

const props = defineProps({
  events: {
    type: Array,
    required: true,
    default: () => []
  }
})

const chartEl = ref(null)
let chartInstance = null
const timeRange = ref('30') // 默认显示最近30天

// 初始化图表
const initChart = () => {
  if (!chartEl.value) return
  
  // 销毁现有实例
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  // 创建新实例
  chartInstance = echarts.init(chartEl.value)
  
  // 获取过滤后的事件数据
  const filteredEvents = filterEventsByTimeRange()
  
  // 准备图表数据
  const timelineData = prepareTimelineData(filteredEvents)
  
  // 配置图表选项
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        const event = params[0].data.event
        const date = format(new Date(event.date), 'yyyy年MM月dd日')
        const type = event.type === 'given' ? '送礼' : '收礼'
        const sign = event.type === 'given' ? '-' : '+'
        const valueColor = event.type === 'given' ? '#ef4444' : '#10b981'
        
        return `
          <div style="margin-bottom: 5px; font-weight: 600">${date}</div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 3px">
            <span>${event.description}</span>
            <span style="color: ${valueColor}; font-weight: 600">${sign}¥${event.value.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>类型:</span>
            <span>${type}</span>
          </div>
          <div style="display: flex; justify-content: space-between">
            <span>联系人:</span>
            <span>${event.contactName || '未知'}</span>
          </div>
          ${event.notes ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e2e8f0">备注: ${event.notes}</div>` : ''}
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: {
        lineStyle: {
          color: '#cbd5e1'
        }
      },
      axisLabel: {
        color: '#64748b',
        formatter: function(value) {
          return format(new Date(value), 'MM/dd')
        }
      },
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      name: '金额 (¥)',
      nameTextStyle: {
        color: '#64748b',
        padding: [0, 0, 0, 10]
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#64748b'
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9'
        }
      }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
        minValueSpan: 3600 * 24 * 1000 * 7 // 最小缩放范围为7天
      }
    ],
    series: [
      {
        name: '人情事件',
        type: 'scatter',
        symbolSize: function(data) {
          // 根据金额大小调整点的大小
          return Math.min(Math.max(data[2] / 50, 8), 20)
        },
        data: timelineData,
        itemStyle: {
          color: function(params) {
            return params.data.event.type === 'given' ? '#ef4444' : '#10b981'
          },
          borderColor: '#fff',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  }
  
  // 应用配置
  chartInstance.setOption(option)
  
  // 添加点击事件
  chartInstance.on('click', function(params) {
    console.log('点击事件:', params.data.event)
    // 这里可以扩展为打开事件详情
  })
}

// 根据时间范围过滤事件
const filterEventsByTimeRange = () => {
  const now = new Date()
  let startDate = new Date()
  
  switch (timeRange.value) {
    case '7':
      startDate.setDate(now.getDate() - 7)
      break
    case '30':
      startDate.setDate(now.getDate() - 30)
      break
    case '90':
      startDate.setDate(now.getDate() - 90)
      break
    case 'all':
      // 全部时间，不需要过滤
      return [...props.events]
    default:
      startDate.setDate(now.getDate() - 30)
  }
  
  return props.events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= startDate
  })
}

// 准备时间线数据
const prepareTimelineData = (events) => {
  return events.map(event => {
    return {
      name: event.description,
      value: [
        event.date, // X轴 - 时间
        event.value, // Y轴 - 金额
        event.value, // 用于确定点的大小
        event // 原始事件数据
      ]
    }
  })
}

// 响应式调整图表大小
const resizeChart = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听事件数据变化
watch(() => props.events, () => {
  initChart()
}, { deep: true })

// 监听时间范围变化
watch(timeRange, () => {
  initChart()
})

// 生命周期钩子
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', resizeChart)
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
</style>