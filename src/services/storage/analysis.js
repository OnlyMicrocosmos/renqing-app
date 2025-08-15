// src/storage/analysis.js
import { getEvents, getContacts } from './indexedDB.js';
import { formatCurrency } from '@/utils/currency.js';
import { getDateRange } from '@/utils/date.js';

/**
 * 人情平衡分析服务
 * 提供仪表盘所需的数据分析功能
 */
export default {
  /**
   * 获取人情平衡总览数据
   * @returns {Promise<Object>} 人情平衡数据
   */
  async getBalanceOverview() {
    const events = await getEvents();
    
    let totalGiven = 0;   // 总支出（送礼）
    let totalReceived = 0; // 总收入（收礼）
    let netBalance = 0;   // 净人情值
    
    events.forEach(event => {
      if (event.type === 'given') {
        totalGiven += event.amount || 0;
      } else if (event.type === 'received') {
        totalReceived += event.amount || 0;
      }
    });
    
    netBalance = totalReceived - totalGiven;
    
    return {
      totalGiven: formatCurrency(totalGiven),
      totalReceived: formatCurrency(totalReceived),
      netBalance: formatCurrency(netBalance),
      ratio: totalReceived > 0 ? (totalGiven / totalReceived).toFixed(2) : 0
    };
  },

  /**
   * 获取联系人往来分析
   * @returns {Promise<Array>} 联系人往来数据
   */
  async getContactAnalysis() {
    const events = await getEvents();
    const contacts = await getContacts();
    
    const contactMap = new Map();
    contacts.forEach(contact => {
      contactMap.set(contact.id, {
        id: contact.id,
        name: contact.name,
        totalGiven: 0,
        totalReceived: 0,
        lastEventDate: null,
        eventCount: 0
      });
    });
    
    events.forEach(event => {
      if (!contactMap.has(event.contactId)) return;
      
      const contact = contactMap.get(event.contactId);
      contact.eventCount++;
      
      if (event.type === 'given') {
        contact.totalGiven += event.amount || 0;
      } else if (event.type === 'received') {
        contact.totalReceived += event.amount || 0;
      }
      
      if (!contact.lastEventDate || new Date(event.date) > new Date(contact.lastEventDate)) {
        contact.lastEventDate = event.date;
      }
    });
    
    return Array.from(contactMap.values())
      .filter(contact => contact.eventCount > 0)
      .map(contact => ({
        ...contact,
        balance: contact.totalReceived - contact.totalGiven,
        formattedBalance: formatCurrency(contact.totalReceived - contact.totalGiven)
      }))
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));
  },

  /**
   * 获取事件时间线分析
   * @param {string} period 时间范围 (week/month/year/all)
   * @returns {Promise<Array>} 时间线数据
   */
  async getEventTimeline(period = 'month') {
    const events = await getEvents();
    const { startDate, endDate } = getDateRange(period);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(event => ({
        ...event,
        formattedAmount: formatCurrency(event.amount),
        isGiven: event.type === 'given'
      }));
  },

  /**
   * 获取分类统计报表
   * @returns {Promise<Object>} 分类统计数据
   */
  async getCategoryReport() {
    const events = await getEvents();
    
    const categories = {
      gift: { given: 0, received: 0, count: 0 },
      wedding: { given: 0, received: 0, count: 0 },
      birthday: { given: 0, received: 0, count: 0 },
      funeral: { given: 0, received: 0, count: 0 },
      other: { given: 0, received: 0, count: 0 }
    };
    
    events.forEach(event => {
      const category = event.category || 'other';
      if (!categories[category]) category = 'other';
      
      if (event.type === 'given') {
        categories[category].given += event.amount || 0;
      } else {
        categories[category].received += event.amount || 0;
      }
      categories[category].count++;
    });
    
    // 转换为图表友好格式
    const chartData = {
      labels: Object.keys(categories),
      datasets: [
        {
          label: '送礼',
          data: Object.values(categories).map(c => c.given),
          backgroundColor: '#4CAF50'
        },
        {
          label: '收礼',
          data: Object.values(categories).map(c => c.received),
          backgroundColor: '#2196F3'
        }
      ]
    };
    
    return {
      rawData: categories,
      chartData,
      totalEvents: events.length
    };
  },

  /**
   * 获取即将到来的人情事件
   * @param {number} days 天数范围
   * @returns {Promise<Array>} 即将到来的事件
   */
  async getUpcomingEvents(days = 7) {
    const events = await getEvents();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate > now && eventDate <= futureDate;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }
};