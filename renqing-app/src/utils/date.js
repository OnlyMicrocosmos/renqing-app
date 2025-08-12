// src/utils/date.js

/**
 * 日期处理工具
 * 提供日期格式化、计算和比较功能
 */
export default {
  /**
   * 格式化日期
   * @param {Date|string} date - 日期对象或字符串
   * @param {string} [format='yyyy-MM-dd'] - 格式模板
   * @returns {string} 格式化后的日期字符串
   */
  format(date, format = 'yyyy-MM-dd') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const pad = (num) => num.toString().padStart(2, '0');
    
    const replacements = {
      'yyyy': d.getFullYear(),
      'yy': d.getFullYear().toString().slice(-2),
      'MM': pad(d.getMonth() + 1),
      'dd': pad(d.getDate()),
      'HH': pad(d.getHours()),
      'mm': pad(d.getMinutes()),
      'ss': pad(d.getSeconds())
    };
    
    return format.replace(/yyyy|yy|MM|dd|HH|mm|ss/g, match => replacements[match]);
  },
  
  /**
   * 获取相对时间描述
   * @param {Date|string} date - 日期
   * @returns {string} 相对时间字符串
   */
  fromNow(date) {
    const now = new Date();
    const target = new Date(date);
    const diffInSeconds = Math.floor((now - target) / 1000);
    
    if (diffInSeconds < 60) return '刚刚';
    
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}分钟前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}天前`;
    
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}个月前`;
    
    return `${Math.floor(months / 12)}年前`;
  },
  
  /**
   * 获取日期范围
   * @param {string} period - 时间段 (today/week/month/year/all)
   * @returns {Object} 包含开始日期和结束日期的对象
   */
  getDateRange(period = 'month') {
    const now = new Date();
    const start = new Date();
    const end = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(start.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default: // 'all'
        start.setFullYear(2000, 0, 1);
        end.setFullYear(2100, 11, 31);
    }
    
    return { startDate: start, endDate: end };
  },
  
  /**
   * 计算日期差
   * @param {Date|string} date1 - 日期1
   * @param {Date|string} date2 - 日期2
   * @param {string} [unit='days'] - 单位 (days/hours/minutes)
   * @returns {number} 差值
   */
  diff(date1, date2, unit = 'days') {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffMs = Math.abs(d2 - d1);
    
    switch (unit) {
      case 'minutes': return Math.floor(diffMs / (1000 * 60));
      case 'hours': return Math.floor(diffMs / (1000 * 60 * 60));
      case 'days': return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      default: return diffMs;
    }
  },
  
  /**
   * 添加时间到日期
   * @param {Date|string} date - 基准日期
   * @param {number} amount - 数量
   * @param {string} unit - 单位 (days/months/years)
   * @returns {Date} 新日期
   */
  add(date, amount, unit) {
    const d = new Date(date);
    
    switch (unit) {
      case 'days': d.setDate(d.getDate() + amount); break;
      case 'months': d.setMonth(d.getMonth() + amount); break;
      case 'years': d.setFullYear(d.getFullYear() + amount); break;
    }
    
    return d;
  },
  
  /**
   * 检查日期是否在范围内
   * @param {Date} date - 要检查的日期
   * @param {Date} start - 开始日期
   * @param {Date} end - 结束日期
   * @returns {boolean} 是否在范围内
   */
  isBetween(date, start, end) {
    const d = new Date(date);
    return d >= new Date(start) && d <= new Date(end);
  }
};