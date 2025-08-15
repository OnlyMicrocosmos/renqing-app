// src/services/api/event.js
import { apiClient } from '../apiClient'
import { saveToDB, getFromDB } from '../storage/indexedDB'
import { useAuthStore } from '@/stores/auth.store'

// 获取所有事件
export const getEvents = async (params = {}) => {
  try {
    const authStore = useAuthStore()
    
    // 从本地存储获取缓存数据
    const cachedEvents = await getFromDB('events')
    
    // 如果没有参数，且缓存存在，先返回缓存
    if (Object.keys(params).length === 0 && cachedEvents && cachedEvents.length > 0) {
      return cachedEvents
    }
    
    // 调用API
    const response = await apiClient.get('/events', {
      params,
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const events = response.data
    
    // 保存到本地存储
    await saveToDB('events', events)
    
    return events
  } catch (error) {
    // 如果API失败但本地有缓存，返回缓存
    const cachedEvents = await getFromDB('events')
    if (cachedEvents && cachedEvents.length > 0) {
      console.warn('使用缓存数据，API请求失败:', error)
      return cachedEvents
    }
    
    throw new Error(error.message || '获取事件失败')
  }
}

// 创建新事件
export const createEvent = async (eventData) => {
  try {
    const authStore = useAuthStore()
    
    // 基本验证
    if (!eventData.description || eventData.description.trim().length === 0) {
      throw new Error('事件描述不能为空')
    }
    
    if (!eventData.contactId) {
      throw new Error('请选择联系人')
    }
    
    if (!eventData.value || eventData.value <= 0) {
      throw new Error('金额必须大于0')
    }
    
    if (!eventData.date) {
      throw new Error('请选择日期')
    }
    
    // 调用API
    const response = await apiClient.post('/events', eventData, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const newEvent = response.data
    
    // 更新本地存储
    const currentEvents = await getFromDB('events') || []
    await saveToDB('events', [...currentEvents, newEvent])
    
    return newEvent
  } catch (error) {
    throw new Error(error.message || '创建事件失败')
  }
}

// 更新事件
export const updateEvent = async (eventId, eventData) => {
  try {
    const authStore = useAuthStore()
    
    // 基本验证
    if (!eventData.description || eventData.description.trim().length === 0) {
      throw new Error('事件描述不能为空')
    }
    
    if (!eventData.value || eventData.value <= 0) {
      throw new Error('金额必须大于0')
    }
    
    // 调用API
    const response = await apiClient.put(`/events/${eventId}`, eventData, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const updatedEvent = response.data
    
    // 更新本地存储
    const currentEvents = await getFromDB('events') || []
    const updatedEvents = currentEvents.map(event => 
      event.id === eventId ? updatedEvent : event
    )
    await saveToDB('events', updatedEvents)
    
    return updatedEvent
  } catch (error) {
    // 处理已知错误
    if (error.response) {
      const { status } = error.response
      
      if (status === 404) {
        throw new Error('事件不存在或已被删除')
      }
    }
    
    throw new Error(error.message || '更新事件失败')
  }
}

// 删除事件
export const deleteEvent = async (eventId) => {
  try {
    const authStore = useAuthStore()
    
    // 调用API
    await apiClient.delete(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    // 更新本地存储
    const currentEvents = await getFromDB('events') || []
    const updatedEvents = currentEvents.filter(event => event.id !== eventId)
    await saveToDB('events', updatedEvents)
    
    return true
  } catch (error) {
    // 处理已知错误
    if (error.response) {
      const { status } = error.response
      
      if (status === 404) {
        throw new Error('事件不存在或已被删除')
      }
    }
    
    throw new Error(error.message || '删除事件失败')
  }
}

// 获取事件详情
export const getEventDetails = async (eventId) => {
  try {
    // 先尝试从本地获取
    const currentEvents = await getFromDB('events') || []
    const localEvent = currentEvents.find(event => event.id === eventId)
    
    if (localEvent) {
      return localEvent
    }
    
    // 本地没有，从API获取
    const authStore = useAuthStore()
    const response = await apiClient.get(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取事件详情失败')
  }
}

// 获取联系人相关事件
export const getEventsByContact = async (contactId) => {
  try {
    // 先尝试从本地获取
    const currentEvents = await getFromDB('events') || []
    const contactEvents = currentEvents.filter(event => event.contactId === contactId)
    
    if (contactEvents.length > 0) {
      return contactEvents
    }
    
    // 本地没有，从API获取
    const authStore = useAuthStore()
    const response = await apiClient.get(`/contacts/${contactId}/events`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取联系人事件失败')
  }
}

// 搜索事件
export const searchEvents = async (query) => {
  try {
    // 先尝试从本地搜索
    const currentEvents = await getFromDB('events') || []
    
    const lowerQuery = query.toLowerCase()
    const localResults = currentEvents.filter(event => 
      event.description.toLowerCase().includes(lowerQuery) || 
      (event.notes && event.notes.toLowerCase().includes(lowerQuery))
    )
    
    if (localResults.length > 0) {
      return localResults
    }
    
    // 本地没有匹配项，从API搜索
    const authStore = useAuthStore()
    const response = await apiClient.get('/events/search', {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '搜索事件失败')
  }
}