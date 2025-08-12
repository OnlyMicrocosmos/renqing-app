import { defineStore } from 'pinia'
import { fetchContacts, createContact, updateContact, deleteContact } from '@/services/contact'
import { saveToDB, getFromDB } from '@/services/storage'

export const useContactStore = defineStore('contact', {
  state: () => ({
    contacts: [],
    loading: false,
    error: null,
    currentContact: null
  }),
  actions: {
    async loadContacts() {
      try {
        this.loading = true
        this.error = null
        
        // 尝试从本地存储加载缓存数据
        try {
          const cachedContacts = await getFromDB('contacts')
          if (cachedContacts && cachedContacts.length > 0) {
            this.contacts = cachedContacts
          }
        } catch (cacheError) {
          console.warn('Failed to load from cache:', cacheError)
        }
        
        // 从服务器获取最新数据
        const contacts = await fetchContacts()
        this.contacts = contacts
        
        // 更新本地缓存
        try {
          await saveToDB('contacts', contacts)
        } catch (saveError) {
          console.warn('Failed to save to cache:', saveError)
        }
      } catch (error) {
        this.error = error.message || '加载联系人失败'
      } finally {
        this.loading = false
      }
    },
    async addContact(contactData) {
      try {
        this.loading = true
        this.error = null
        
        const newContact = await createContact(contactData)
        this.contacts.push(newContact)
        
        // 更新本地缓存
        try {
          await saveToDB('contacts', this.contacts)
        } catch (saveError) {
          console.warn('Failed to save to cache:', saveError)
        }
        
        return newContact
      } catch (error) {
        this.error = error.message || '添加联系人失败'
        return null
      } finally {
        this.loading = false
      }
    },
    async updateContact(contactId, contactData) {
      try {
        this.loading = true
        this.error = null
        
        const updatedContact = await updateContact(contactId, contactData)
        const index = this.contacts.findIndex(c => c.id === contactId)
        if (index !== -1) {
          this.contacts[index] = updatedContact
        }
        
        // 更新本地缓存
        try {
          await saveToDB('contacts', this.contacts)
        } catch (saveError) {
          console.warn('Failed to save to cache:', saveError)
        }
        
        return updatedContact
      } catch (error) {
        this.error = error.message || '更新联系人失败'
        return null
      } finally {
        this.loading = false
      }
    },
    async deleteContact(contactId) {
      try {
        this.loading = true
        this.error = null
        
        await deleteContact(contactId)
        this.contacts = this.contacts.filter(c => c.id !== contactId)
        
        // 更新本地缓存
        try {
          await saveToDB('contacts', this.contacts)
        } catch (saveError) {
          console.warn('Failed to save to cache:', saveError)
        }
        
        return true
      } catch (error) {
        this.error = error.message || '删除联系人失败'
        return false
      } finally {
        this.loading = false
      }
    },
    setCurrentContact(contact) {
      this.currentContact = contact
    },
    clearCurrentContact() {
      this.currentContact = null
    }
  },
  getters: {
    contactById: (state) => (id) => {
      return state.contacts.find(c => c.id === id)
    }
  }
})