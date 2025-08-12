// src/services/api/contact.js
import { apiClient } from '../apiClient'
import { saveToDB, getFromDB } from '../storage/indexedDB'
import { useAuthStore } from '@/stores/auth.store'
import { validatePhone } from '@/utils/validator'

// 获取所有联系人
export const getContacts = async (params = {}) => {
  try {
    const authStore = useAuthStore()
    
    // 从本地存储获取缓存数据
    const cachedContacts = await getFromDB('contacts')
    
    // 如果没有参数，且缓存存在，先返回缓存
    if (Object.keys(params).length === 0 && cachedContacts && cachedContacts.length > 0) {
      return cachedContacts
    }
    
    // 调用API
    const response = await apiClient.get('/contacts', {
      params,
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const contacts = response.data
    
    // 保存到本地存储
    await saveToDB('contacts', contacts)
    
    return contacts
  } catch (error) {
    // 如果API失败但本地有缓存，返回缓存
    const cachedContacts = await getFromDB('contacts')
    if (cachedContacts && cachedContacts.length > 0) {
      console.warn('使用缓存数据，API请求失败:', error)
      return cachedContacts
    }
    
    throw new Error(error.message || '获取联系人失败')
  }
}

// 创建新联系人
export const createContact = async (contactData) => {
  try {
    const authStore = useAuthStore()
    
    // 基本验证
    if (!contactData.name || contactData.name.trim().length < 2) {
      throw new Error('联系人姓名至少需要2个字符')
    }
    
    if (contactData.phone && !validatePhone(contactData.phone)) {
      throw new Error('请输入有效的手机号码')
    }
    
    // 调用API
    const response = await apiClient.post('/contacts', contactData, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const newContact = response.data
    
    // 更新本地存储
    const currentContacts = await getFromDB('contacts') || []
    await saveToDB('contacts', [...currentContacts, newContact])
    
    return newContact
  } catch (error) {
    throw new Error(error.message || '创建联系人失败')
  }
}

// 更新联系人
export const updateContact = async (contactId, contactData) => {
  try {
    const authStore = useAuthStore()
    
    // 基本验证
    if (!contactData.name || contactData.name.trim().length < 2) {
      throw new Error('联系人姓名至少需要2个字符')
    }
    
    if (contactData.phone && !validatePhone(contactData.phone)) {
      throw new Error('请输入有效的手机号码')
    }
    
    // 调用API
    const response = await apiClient.put(`/contacts/${contactId}`, contactData, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    const updatedContact = response.data
    
    // 更新本地存储
    const currentContacts = await getFromDB('contacts') || []
    const updatedContacts = currentContacts.map(contact => 
      contact.id === contactId ? updatedContact : contact
    )
    await saveToDB('contacts', updatedContacts)
    
    return updatedContact
  } catch (error) {
    // 处理已知错误
    if (error.response) {
      const { status } = error.response
      
      if (status === 404) {
        throw new Error('联系人不存在或已被删除')
      }
    }
    
    throw new Error(error.message || '更新联系人失败')
  }
}

// 删除联系人
export const deleteContact = async (contactId) => {
  try {
    const authStore = useAuthStore()
    
    // 调用API
    await apiClient.delete(`/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    // 更新本地存储
    const currentContacts = await getFromDB('contacts') || []
    const updatedContacts = currentContacts.filter(contact => contact.id !== contactId)
    await saveToDB('contacts', updatedContacts)
    
    // 同时删除相关事件
    try {
      const currentEvents = await getFromDB('events') || []
      const updatedEvents = currentEvents.filter(event => event.contactId !== contactId)
      await saveToDB('events', updatedEvents)
    } catch (e) {
      console.error('删除联系人相关事件失败:', e)
    }
    
    return true
  } catch (error) {
    // 处理已知错误
    if (error.response) {
      const { status } = error.response
      
      if (status === 404) {
        throw new Error('联系人不存在或已被删除')
      }
      
      if (status === 409) {
        throw new Error('无法删除有相关事件的联系人')
      }
    }
    
    throw new Error(error.message || '删除联系人失败')
  }
}

// 获取联系人详情
export const getContactDetails = async (contactId) => {
  try {
    // 先尝试从本地获取
    const currentContacts = await getFromDB('contacts') || []
    const localContact = currentContacts.find(contact => contact.id === contactId)
    
    if (localContact) {
      return localContact
    }
    
    // 本地没有，从API获取
    const authStore = useAuthStore()
    const response = await apiClient.get(`/contacts/${contactId}`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取联系人详情失败')
  }
}

// 搜索联系人
export const searchContacts = async (query) => {
  try {
    // 先尝试从本地搜索
    const currentContacts = await getFromDB('contacts') || []
    
    const lowerQuery = query.toLowerCase()
    const localResults = currentContacts.filter(contact => 
      contact.name.toLowerCase().includes(lowerQuery) || 
      (contact.phone && contact.phone.includes(query)) ||
      (contact.email && contact.email.toLowerCase().includes(lowerQuery)) ||
      (contact.relationship && contact.relationship.toLowerCase().includes(lowerQuery))
    )
    
    if (localResults.length > 0) {
      return localResults
    }
    
    // 本地没有匹配项，从API搜索
    const authStore = useAuthStore()
    const response = await apiClient.get('/contacts/search', {
      params: { q: query },
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '搜索联系人失败')
  }
}

// 获取联系人统计信息
export const getContactStats = async (contactId) => {
  try {
    const authStore = useAuthStore()
    const response = await apiClient.get(`/contacts/${contactId}/stats`, {
      headers: {
        Authorization: `Bearer ${authStore.user.token}`
      }
    })
    
    return response.data
  } catch (error) {
    throw new Error(error.message || '获取联系人统计失败')
  }
}