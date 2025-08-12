import { defineStore } from 'pinia'
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '@/services/api/event'
import { saveToDB, getFromDB } from '@/services/storage/indexedDB'
import { useAuthStore } from '@/stores/auth.store'

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [],
    loading: false,
    error: null,
    currentEvent: null
  }),
  actions: {
    async loadEvents() {
      try {
        this.loading = true
        this.error = null
        
        const authStore = useAuthStore()
        if (!authStore.isAuthenticated) return
        
        // 尝试从本地存储加载缓存数据
        try {
          const cachedEvents = await getFromDB('events')
          if (cachedEvents && cachedEvents.length > 0) {
            this.events = cachedEvents
          }
        } catch (cacheError) {
          console.warn('Failed to load events from cache:', cacheError)
        }
        
        // 从服务器获取最新数据
        const events = await fetchEvents()
        this.events = events
        
        // 更新本地缓存
        try {
          await saveToDB('events', events)
        } catch (saveError) {
          console.warn('Failed to save events to cache:', saveError)
        }
      } catch (error) {
        this.error = error.message || '加载事件失败'
      } finally {
        this.loading = false
      }
    },
    
    async addEvent(eventData) {
      try {
        this.loading = true
        this.error = null
        
        const newEvent = await createEvent(eventData)
        this.events.push(newEvent)
        
        // 更新本地缓存
        try {
          await saveToDB('events', this.events)
        } catch (saveError) {
          console.warn('Failed to save events to cache:', saveError)
        }
        
        return newEvent
      } catch (error) {
        this.error = error.message || '添加事件失败'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async updateEvent(eventId, eventData) {
      try {
        this.loading = true
        this.error = null
        
        const updatedEvent = await updateEvent(eventId, eventData)
        const index = this.events.findIndex(e => e.id === eventId)
        if (index !== -1) {
          this.events[index] = updatedEvent
        }
        
        // 更新本地缓存
        try {
          await saveToDB('events', this.events)
        } catch (saveError) {
          console.warn('Failed to save events to cache:', saveError)
        }
        
        return updatedEvent
      } catch (error) {
        this.error = error.message || '更新事件失败'
        return null
      } finally {
        this.loading = false
      }
    },
    
    async deleteEvent(eventId) {
      try {
        this.loading = true
        this.error = null
        
        await deleteEvent(eventId)
        this.events = this.events.filter(e => e.id !== eventId)
        
        // 更新本地缓存
        try {
          await saveToDB('events', this.events)
        } catch (saveError) {
          console.warn('Failed to save events to cache:', saveError)
        }
        
        return true
      } catch (error) {
        this.error = error.message || '删除事件失败'
        return false
      } finally {
        this.loading = false
      }
    },
    
    setCurrentEvent(event) {
      this.currentEvent = event
    },
    
    clearCurrentEvent() {
      this.currentEvent = null
    }
  },
  getters: {
    getEventsByContact: (state) => (contactId) => {
      return state.events.filter(event => event.contactId === contactId)
    },
    
    recentEvents: (state) => {
      return [...state.events]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    },
    
    totalBalance: (state) => {
      return state.events.reduce((total, event) => {
        return event.type === 'received' ? total - event.value : total + event.value
      }, 0)
    },
    
    totalGiven: (state) => {
      return state.events
        .filter(e => e.type === 'given')
        .reduce((sum, e) => sum + e.value, 0)
    },
    
    totalReceived: (state) => {
      return state.events
        .filter(e => e.type === 'received')
        .reduce((sum, e) => sum + e.value, 0)
    }
  }
})