<template>
  <div class="analysis-view">
    <h1>Analysis View</h1>
    <BalanceChart :data="balanceData" />
    <TimelineChart :data="timelineData" />
  </div>
</template>

<script>
import BalanceChart from '../components/charts/BalanceChart.vue'
import TimelineChart from '../components/charts/TimelineChart.vue'

export default {
  name: 'AnalysisView',
  components: {
    BalanceChart,
    TimelineChart
  },
  data() {
    return {
      balanceData: [], // 示例数据，实际应从状态或服务获取
      timelineData: [] // 示例数据，实际应从状态或服务获取
    }
  }
}
</script>

<style scoped>
/* styles */
</style>