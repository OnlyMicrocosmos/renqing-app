<template>
  <div class="contact-view">
    <div class="page-header flex-between">
      <div>
        <h1>联系人管理</h1>
        <p>管理您的人情往来联系人</p>
      </div>
      <button class="btn" @click="showAddForm = true">
        <i class="icon-plus"></i> 添加联系人
      </button>
    </div>

    <div class="search-box card mb-3">
      <div class="search-input">
        <i class="icon-search"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索联系人..." 
          class="search-field"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>
      <div v-if="filteredContacts.length === 0" class="empty-state card">
        <i class="icon-user"></i>
        <p>暂无联系人</p>
        <button class="btn" @click="showAddForm = true">添加第一个联系人</button>
      </div>
      
      <div v-else class="contacts-grid">
        <ContactCard 
          v-for="contact in filteredContacts" 
          :key="contact.id" 
          :contact="contact" 
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 添加/编辑联系人模态框 -->
    <div v-if="showAddForm || showEditForm" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ showEditForm ? '编辑联系人' : '添加联系人' }}</h3>
          <button class="modal-close" @click="closeModal">&times;</button>
        </div>
        <ContactForm 
          :contact="editingContact" 
          @submit="handleSave" 
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useContactStore } from '@/stores/contact.store'
import ContactForm from '@/components/contact/ContactForm.vue'
import ContactCard from '@/components/contact/ContactCard.vue'

const contactStore = useContactStore()
const searchQuery = ref('')
const loading = ref(true)
const error = ref(null)
const showAddForm = ref(false)
const showEditForm = ref(false)
const editingContact = ref(null)

onMounted(async () => {
  try {
    await contactStore.loadContacts()
  } catch (err) {
    error.value = err.message || '加载联系人失败'
  } finally {
    loading.value = false
  }
})

const filteredContacts = computed(() => {
  if (!searchQuery.value) {
    // 确保 contacts 是一个数组，避免 undefined
    return contactStore.contacts || []
  }
  
  const query = searchQuery.value.toLowerCase()
  // 确保 contacts 是一个数组，避免 undefined
  return (contactStore.contacts || []).filter(contact => 
    contact.name.toLowerCase().includes(query) ||
    (contact.phone && contact.phone.includes(query)) ||
    (contact.relation && contact.relation.toLowerCase().includes(query))
  )
})

const handleEdit = (contact) => {
  editingContact.value = { ...contact }
  showEditForm.value = true
}

const handleDelete = async (contactId) => {
  if (confirm('确定要删除这个联系人吗？此操作不可撤销。')) {
    try {
      await contactStore.deleteContact(contactId)
    } catch (err) {
      alert('删除联系人失败: ' + err.message)
    }
  }
}

const handleSave = async (contactData) => {
  try {
    if (showEditForm.value) {
      await contactStore.updateContact(editingContact.value.id, contactData)
    } else {
      await contactStore.createContact(contactData)
    }
    closeModal()
    // 添加成功反馈
    alert('联系人保存成功')
  } catch (err) {
    alert('保存联系人失败: ' + err.message)
  }
}

const closeModal = () => {
  showAddForm.value = false
  showEditForm.value = false
  editingContact.value = null
}
</script>

<style scoped>
.contact-view {
  padding-bottom: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray);
  margin: 0;
}

.search-box {
  padding: 1rem;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input i {
  position: absolute;
  left: 1rem;
  color: var(--gray);
}

.search-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  outline: none;
  transition: var(--transition);
}

.search-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.contacts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--light-gray);
  margin-bottom: 1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--gray);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--light-gray);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray);
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: var(--dark);
}

@media (max-width: 768px) {
  .contacts-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .modal-header {
    padding: 1rem;
  }
}
</style>