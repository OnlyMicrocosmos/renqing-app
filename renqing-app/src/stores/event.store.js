// src/stores/event.store.js
import { defineStore } from 'pinia';
import { getEvents, saveEvent, deleteEvent } from '@/services/storage/indexedDB.js';

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    selectedEvent: null,
    filters: {
      type: 'all', // 'given'|'received'|'all'
      category: 'all',
      dateRange: 'month',
      searchQuery: ''
    },
    loading: false,
    error: null,
    lastLoaded: null
  }),

  actions: {
    /**
     * 从数据库加载事件
     */
    async loadEvents() {
      this.loading = true;
      this.error = null;
      
      try {
        this.events = await getEvents();
        this.lastLoaded = new Date().toISOString();
        
        // ✅ 修复：通知所有订阅者数据已更新
        this.$patch({ events: this.events });
        return this.events;
      } catch (error) {
        this.error = '加载事件失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建新事件
     * @param {Object} eventData - 事件数据
     */
    async createEvent(eventData) {
      this.loading = true;
      
      try {
        const newEvent = await saveEvent({
          ...eventData,
          id: Date.now().toString(), // 生成唯一ID
          createdAt: new Date().toISOString()
        });
        
        this.events.unshift(newEvent);
        return newEvent;
      } catch (error) {
        this.error = '创建事件失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新事件
     * @param {string} id - 事件ID
     * @param {Object} updates - 更新数据
     */
    async updateEvent(id, updates) {
      this.loading = true;
      
      try {
        const eventIndex = this.events.findIndex(e => e.id === id);
        if (eventIndex === -1) throw new Error('事件未找到');
        
        const updatedEvent = { 
          ...this.events[eventIndex], 
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        await saveEvent(updatedEvent);
        this.events.splice(eventIndex, 1, updatedEvent);
        
        return updatedEvent;
      } catch (error) {
        this.error = '更新事件失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 批量更新事件
     * @param {Array} events - 事件数组
     */
    async updateEvents(events) {
      this.loading = true;
      
      try {
        const updatedEvents = [];
        for (const event of events) {
          const updatedEvent = await saveEvent(event);
          updatedEvents.push(updatedEvent);
          
          // 更新本地状态
          const eventIndex = this.events.findIndex(e => e.id === event.id);
          if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1, updatedEvent);
          }
        }
        
        return updatedEvents;
      } catch (error) {
        this.error = '批量更新事件失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 删除事件
     * @param {string} id - 事件ID
     */
    async deleteEvent(id) {
      this.loading = true;
      
      try {
        await deleteEvent(id);
        this.events = this.events.filter(event => event.id !== id);
        
        if (this.selectedEvent?.id === id) {
          this.selectedEvent = null;
        }
      } catch (error) {
        this.error = '删除事件失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 选择当前操作的事件
     * @param {Object|null} event - 事件对象
     */
    selectEvent(event) {
      this.selectedEvent = event;
    },

    /**
     * 更新筛选条件
     * @param {Object} newFilters - 新筛选条件
     */
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

  },

  getters: {
    /**
     * 获取筛选后的事件
     * @returns {Array} 筛选后的事件列表
     */
    filteredEvents: (state) => {
      let events = [...state.events];
      
      // 类型筛选
      if (state.filters.type !== 'all') {
        events = events.filter(e => e.type === state.filters.type);
      }
      
      // 类别筛选
      if (state.filters.category !== 'all') {
        events = events.filter(e => e.category === state.filters.category);
      }
      
      // 搜索筛选
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        events = events.filter(e => 
          e.title.toLowerCase().includes(query) || 
          e.description?.toLowerCase().includes(query)
        );
      }
      
      // 日期范围筛选
      const now = new Date();
      switch (state.filters.dateRange) {
        case 'week':
          const oneWeekAgo = new Date(now);
          oneWeekAgo.setDate(now.getDate() - 7);
          events = events.filter(e => new Date(e.date) >= oneWeekAgo);
          break;
        case 'month':
          const oneMonthAgo = new Date(now);
          oneMonthAgo.setMonth(now.getMonth() - 1);
          events = events.filter(e => new Date(e.date) >= oneMonthAgo);
          break;
        case 'year':
          const oneYearAgo = new Date(now);
          oneYearAgo.setFullYear(now.getFullYear() - 1);
          events = events.filter(e => new Date(e.date) >= oneYearAgo);
          break;
      }
      
      // 按日期倒序排序
      return events.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    /**
     * 获取最近事件
     * @returns {Array} 最近的5个事件
     */
    recentEvents: (state) => {
      return [...state.events]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    },
    
    /**
     * 计算总送礼金额
     * @returns {number} 送礼总额
     */
    totalGiven: (state) => {
      return state.events
        .filter(e => e.type === 'given')
        .reduce((sum, e) => sum + (e.value || 0), 0)
    },
    
    /**
     * 计算总收礼金额
     * @returns {number} 收礼总额
     */
    totalReceived: (state) => {
      return state.events
        .filter(e => e.type === 'received')
        .reduce((sum, e) => sum + (e.value || 0), 0)
    },
    
    /**
     * 计算净收支
     * @returns {number} 净收支金额
     */
    totalBalance: (state) => {
      return state.events.reduce((total, event) => {
        return event.type === 'received' ? 
          total + (event.value || 0) : 
          total - (event.value || 0)
      }, 0)
    },

    /**
     * 获取即将到来事件
     * @returns {Array} 即将到来的事件
     */
    upcomingEvents: (state) => {
      const now = new Date();
      const inOneWeek = new Date();
      inOneWeek.setDate(now.getDate() + 7);
      
      return state.events
        .filter(event => {
          const eventDate = new Date(event.date);
          return eventDate > now && eventDate <= inOneWeek;
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  }
});