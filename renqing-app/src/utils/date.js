// 日期格式化
export function formatDate(dateString, format = 'yyyy-MM-dd') {
  const date = new Date(dateString)
  
  const map = {
    'yyyy': date.getFullYear(),
    'MM': (date.getMonth() + 1).toString().padStart(2, '0'),
    'dd': date.getDate().toString().padStart(2, '0'),
    'HH': date.getHours().toString().padStart(2, '0'),
    'mm': date.getMinutes().toString().padStart(2, '0'),
    'ss': date.getSeconds().toString().padStart(2, '0')
  }
  
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, matched => map[matched])
}

export function dateDiff(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getRecentDates(days = 7) {
  const dates = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}