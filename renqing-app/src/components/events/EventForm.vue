<template>
  <div class="event-form">
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label>事件类型</label>
        <div class="type-selector">
          <button 
            type="button"
            :class="{ 'active': formData.type === 'given' }"
            @click="formData.type = 'given'"
          >
            <i class="icon-gift"></i> 送礼
          </button>
          <button 
            type="button"
            :class="{ 'active': formData.type === 'received' }"
            @click="formData.type = 'received'"
          >
            <i class="icon-hand-coin"></i> 收礼
          </button>
        </div>
      </div>

      <div class="form-group">
        <label>联系人</label>
        <select v-model="formData.contactId" class="form-control" required>
          <option value="" disabled>选择联系人</option>
          <option v-for="contact in contacts" :key="contact.id" :value="contact.id">
            {{ contact.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>事件描述</label>
        <input 
          type="text" 
          v-model="formData.description" 
          class="form-control"
          placeholder="例如：结婚礼金、生日礼物等" 
          required
        />
      </div>

      <div class="grid-2">
        <div class="form-group">
          <label>金额/价值</label>
          <div class="input-container">
            <div class="input-prefix">
              <i class="icon-currency"></i>
            </div>
            <input 
              type="number" 
              v-model="formData.value" 
              class="form-control"
              placeholder="输入金额" 
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>日期</label>
          <input 
            type="date" 
            v-model="formData.date" 
            class="form-control"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label>备注</label>
        <textarea 
          v-model="formData.notes" 
          class="form-control"
          placeholder="添加备注信息..."
        ></textarea>
      </div>

      <div class="form-actions">
        <Button 
          type="submit" 
          variant="primary" 
          :loading="loading"
          :full-width="true"
        >
          {{ editing ? '更新事件' : '添加事件' }}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          @click="cancelForm"
          :full-width="true"
          v-if="editing"
        >
          取消
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useContactStore } from '@/stores/contact.store'
import Button from '@/components/ui/Button.vue'
import { format } from 'date-fns'

const props = defineProps({
  eventData: Object,
  editing: Boolean
})

const emit = defineEmits(['submit', 'cancel'])

const contactStore = useContactStore()
const contacts = ref([])
const loading = ref(false)

const formData = ref({
  id: null,
  type: 'given',
  contactId: '',
  description: '',
  value: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: ''
})

// 初始化表单数据
onMounted(async () => {
  await contactStore.loadContacts()
  contacts.value = contactStore.contacts
  
  if (props.eventData) {
    formData.value = { ...props.eventData }
  }
})

// 当传入的事件数据变化时更新表单
watch(() => props.eventData, (newVal) => {
  if (newVal) {
    formData.value = { ...newVal }
  }
})

const submitForm = () => {
  loading.value = true
  emit('submit', formData.value)
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const cancelForm = () => {
  emit('cancel')
}
</script>

<style scoped>
.event-form {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 1.5rem;
}

.type-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.type-selector button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border: 2px solid var(--light-gray);
  border-radius: var(--border-radius);
  background: white;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  color: var(--gray);
}

.type-selector button i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--gray);
}

.type-selector button.active {
  border-color: var(--primary);
  background-color: var(--primary-light);
  color: var(--primary);
}

.type-selector button.active i {
  color: var(--primary);
}

.form-actions {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>