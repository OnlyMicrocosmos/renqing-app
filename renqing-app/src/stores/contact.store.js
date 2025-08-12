// src/stores/contact.store.js
import { defineStore } from 'pinia';
import { getContacts, saveContact, deleteContact } from '@/storage/indexedDB.js';
import analysisService from '@/storage/analysis.js';

export const useContactStore = defineStore('contact', {
  state: () => ({
    contacts: [],
    selectedContact: null,
    filters: {
      group: 'all',
      searchQuery: '',
      balanceType: 'all' // 'positive'|'negative'|'all'
    },
    loading: false,
    error: null
  }),

  actions: {
    /**
     * 从数据库加载联系人
     */
    async loadContacts() {
      this.loading = true;
      this.error = null;
      
      try {
        this.contacts = await getContacts();
        return this.contacts;
      } catch (error) {
        this.error = '加载联系人失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 创建新联系人
     * @param {Object} contactData - 联系人数据
     */
    async createContact(contactData) {
      this.loading = true;
      
      try {
        const newContact = await saveContact({
          ...contactData,
          id: Date.now().toString(), // 生成唯一ID
          createdAt: new Date().toISOString()
        });
        
        this.contacts.unshift(newContact);
        return newContact;
      } catch (error) {
        this.error = '创建联系人失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 更新联系人
     * @param {string} id - 联系人ID
     * @param {Object} updates - 更新数据
     */
    async updateContact(id, updates) {
      this.loading = true;
      
      try {
        const contactIndex = this.contacts.findIndex(c => c.id === id);
        if (contactIndex === -1) throw new Error('联系人未找到');
        
        const updatedContact = { 
          ...this.contacts[contactIndex], 
          ...updates,
          updatedAt: new Date().toISOString()
        };
        
        await saveContact(updatedContact);
        this.contacts.splice(contactIndex, 1, updatedContact);
        
        return updatedContact;
      } catch (error) {
        this.error = '更新联系人失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 删除联系人
     * @param {string} id - 联系人ID
     */
    async deleteContact(id) {
      this.loading = true;
      
      try {
        await deleteContact(id);
        this.contacts = this.contacts.filter(contact => contact.id !== id);
        
        if (this.selectedContact?.id === id) {
          this.selectedContact = null;
        }
      } catch (error) {
        this.error = '删除联系人失败: ' + error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * 选择当前操作的联系人
     * @param {Object|null} contact - 联系人对象
     */
    selectContact(contact) {
      this.selectedContact = contact;
    },

    /**
     * 更新筛选条件
     * @param {Object} newFilters - 新筛选条件
     */
    setFilters(newFilters) {
      this.filters = { ...this.filters, ...newFilters };
    },

    /**
     * 获取联系人的人情平衡数据
     * @returns {Promise<Array>} 联系人平衡数据
     */
    async getContactBalances() {
      return await analysisService.getContactAnalysis();
    }
  },

  getters: {
    /**
     * 获取筛选后的联系人
     * @returns {Array} 筛选后的联系人列表
     */
    filteredContacts: (state) => {
      let contacts = [...state.contacts];
      
      // 分组筛选
      if (state.filters.group !== 'all') {
        contacts = contacts.filter(c => c.group === state.filters.group);
      }
      
      // 搜索筛选
      if (state.filters.searchQuery) {
        const query = state.filters.searchQuery.toLowerCase();
        contacts = contacts.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.phone?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.notes?.toLowerCase().includes(query)
        );
      }
      
      // 按姓名排序
      return contacts.sort((a, b) => a.name.localeCompare(b.name));
    },

    /**
     * 获取所有联系人分组
     * @returns {Array} 分组列表
     */
    contactGroups: (state) => {
      const groups = new Set();
      state.contacts.forEach(contact => {
        if (contact.group) groups.add(contact.group);
      });
      return ['所有分组', ...Array.from(groups)];
    },

    /**
     * 获取重要联系人（人情平衡值绝对值最大的前5个）
     * @returns {Promise<Array>} 重要联系人列表
     */
    async importantContacts() {
      const balances = await this.getContactBalances();
      return balances
        .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
        .slice(0, 5);
    }
  }
});