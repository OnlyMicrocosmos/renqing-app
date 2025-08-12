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
    <div ref="chartEl" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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

const initChart = () => {
  if (!chartEl.value) return
  
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

watch(() => props.data, () => {
  if (chartInstance) {
    chartInstance.setOption({
      series: [{
        data: [
          { value: props.data.given, name: '送礼' },
          { value: props.data.received, name: '收礼' }
        ]
      }]
    })
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', () => chartInstance?.resize())
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
</style>