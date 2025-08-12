import { apiClient } from './apiClient'
import { useAuthStore } from '@/stores/auth.store'

export const fetchEvents = async () => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.get('/events')
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取事件失败')
  }
}

export const createEvent = async (eventData) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.post('/events', eventData)
    return response.data
  } catch (error) {
    throw new Error(error.message || '创建事件失败')
  }
}

export const updateEvent = async (id, eventData) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.put(`/events/${id}`, eventData)
    return response.data
  } catch (error) {
    throw new Error(error.message || '更新事件失败')
  }
}

export const deleteEvent = async (id) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.delete(`/events/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.message || '删除事件失败')
  }
}