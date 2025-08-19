<template>
  <div class="balance-chart">
    <div class="chart-header">
      <h3>人情收支平衡</h3>
      <div class="legend">
        <div class="legend-item">
          <span class="color-box given"></span>
          <span>送礼</span>
        </div>
        <div class="legend-item">
          <span class="color-box received"></span>
          <span>收礼</span>
        </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({
      given: 0,
      received: 0
    })
  }
})

const chartEl = ref(null)
let chartInstance = null

// 计算是否有数据用于展示
const hasData = computed(() => {
  return props.data.given > 0 || props.data.received > 0
})

// 初始化图表
const initChart = () => {
  if (!chartEl.value || !hasData.value) return
  
  chartInstance = echarts.init(chartEl.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      show: false
    },
    color: ['#ff6384', '#36a2eb'],
    series: [
      {
        name: '人情收支',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center',
          formatter: '{b}\n¥{c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: props.data.given, name: '送礼' },
          { value: props.data.received, name: '收礼' }
        ]
      }
    ]
  }
  
  chartInstance.setOption(option)
}

// 更新图表数据
const updateChart = () => {
  if (!chartInstance || !hasData.value) return
  
  chartInstance.setOption({
    series: [{
      data: [
        { value: props.data.given, name: '送礼' },
        { value: props.data.received, name: '收礼' }
      ]
    }]
  })
}

// 监听数据变化
watch(() => props.data, () => {
  if (hasData.value) {
    if (chartInstance) {
      updateChart()
    } else {
      initChart()
    }
  } else if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

onMounted(() => {
  if (hasData.value) {
    initChart()
  }
  window.addEventListener('resize', handleResize)
})

// 组件卸载前清理
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.balance-chart {
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

.legend {
  display: flex;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray);
}

.color-box {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.color-box.given {
  background-color: #ff6384;
}

.color-box.received {
  background-color: #36a2eb;
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
  
  .legend {
    align-self: flex-end;
  }
  
  .balance-chart {
    padding: 1rem;
  }
}
</style>