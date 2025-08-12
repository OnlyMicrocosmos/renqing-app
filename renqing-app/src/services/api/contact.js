import { apiClient } from './apiClient'
import { useAuthStore } from '@/stores/auth.store'

export const fetchContacts = async () => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.get('/contacts')
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取联系人失败')
  }
}

export const createContact = async (contactData) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.post('/contacts', contactData)
    return response.data
  } catch (error) {
    throw new Error(error.message || '创建联系人失败')
  }
}

export const updateContact = async (id, contactData) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.put(`/contacts/${id}`, contactData)
    return response.data
  } catch (error) {
    throw new Error(error.message || '更新联系人失败')
  }
}

export const deleteContact = async (id) => {
  try {
    const authStore = useAuthStore()
    if (!authStore.user) {
      throw new Error('用户未认证')
    }
    
    const response = await apiClient.delete(`/contacts/${id}`)
    return response.data
  } catch (error) {
    throw new Error(error.message || '删除联系人失败')
  }
}