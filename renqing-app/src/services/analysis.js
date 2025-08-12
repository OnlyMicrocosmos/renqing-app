// Analysis service
export default {
  getBalanceAnalysis() {
    // 获取余额分析数据逻辑
    return [
      { date: '2023-01-01', balance: 100 },
      { date: '2023-01-02', balance: 150 },
      // ... more data
    ];
  },
  getTimelineAnalysis() {
    // 获取时间线分析数据逻辑
    return [
      { date: '2023-01-01', eventCount: 2 },
      { date: '2023-01-02', eventCount: 3 },
      // ... more data
    ];
  }
};