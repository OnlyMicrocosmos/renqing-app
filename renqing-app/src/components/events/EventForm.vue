<template>
  <div class="event-form">
    <!-- 事件类型选择 -->
    <div class="form-group">
      <label>事件类型</label>
      <div class="radio-group">
        <label class="radio-item">
          <input 
            type="radio" 
            v-model="event.type" 
            value="given" 
            @change="onTypeChange"
            :disabled="!event"
          />
          <span>送礼</span>
        </label>
        <label class="radio-item">
          <input 
            type="radio" 
            v-model="event.type" 
            value="received" 
            @change="onTypeChange"
            :disabled="!event"
          />
          <span>收礼</span>
        </label>
      </div>
    </div>

    <!-- 联系人选择 -->
    <div class="form-group">
      <label>联系人</label>
      <select v-model="event.contactId" :disabled="!event">
        <option value="">请选择联系人</option>
        <option v-for="contact in contacts" :key="contact.id" :value="contact.id">
          {{ contact.name }}
        </option>
      </select>
    </div>

    <!-- 事件描述 -->
    <div class="form-group">
      <label>事件描述</label>
      <input 
        v-model="event.description" 
        type="text" 
        placeholder="请输入事件描述"
        :disabled="!event"
      />
    </div>

    <!-- 金额/价值 -->
    <div class="form-group">
      <label>金额/价值</label>
      <input 
        v-model.number="event.amount" 
        type="number" 
        placeholder="请输入金额"
        :disabled="!event"
      />
    </div>

    <!-- 日期 -->
    <div class="form-group">
      <label>日期</label>
      <input 
        v-model="event.date" 
        type="date" 
        :disabled="!event"
      />
    </div>

    <!-- 备注 -->
    <div class="form-group">
      <label>备注</label>
      <textarea 
        v-model="event.notes" 
        placeholder="请输入备注"
        rows="4"
        :disabled="!event"
      ></textarea>
    </div>

    <!-- 按钮 -->
    <div class="form-actions">
      <!-- 使用原生按钮作为替代方案 -->
      <button 
        class="btn btn-primary" 
        :disabled="isSubmitting || !event" 
        @click="handleSubmit"
      >
        {{ isSubmitting ? '提交中...' : '添加事件' }}
      </button>
      
      <!-- 使用原生按钮作为替代方案 -->
      <button 
        class="btn btn-secondary" 
        @click="handleCancel"
        :disabled="!event"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useContactStore } from '@/stores/contact.store'
import { useEventStore } from '@/stores/event.store'
import { useRouter } from 'vue-router'

// 接收父组件传递的 event 数据
const props = defineProps({
  event: {
    type: Object,
    default: () => ({
      id: null,
      type: 'given',
      contactId: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    })
  }
})

// 定义保存和取消事件
const emits = defineEmits(['submit', 'cancel'])

const router = useRouter()
const eventStore = useEventStore()

// 使用 v-model 双向绑定数据
// 确保 event 始终是一个有效的对象
const event = ref({ ...props.event })

// 添加 isSubmitting 状态来跟踪提交过程
const isSubmitting = ref(false)

// 监听 event 变化，同步到本地数据
watch(() => props.event, (newVal) => {
  // 确保 newVal 是一个对象，避免 undefined
  if (newVal && typeof newVal === 'object') {
    event.value = { ...newVal }
  }
}, { immediate: true })

// 获取联系人列表
const contactStore = useContactStore()
const contacts = computed(() => contactStore.contacts)

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  // 添加防御性检查，确保 event 对象存在且有必要的属性
  if (!event.value || !event.value.type || !event.value.contactId || !event.value.description || !event.value.amount || !event.value.date) {
    alert('请填写所有必填字段')
    return
  }

  // 设置提交状态
  isSubmitting.value = true
  
  try {
    // 如果有id则更新事件，否则创建新事件
    if (event.value.id) {
      await eventStore.updateEvent(event.value)
    } else {
      await eventStore.createEvent(event.value)
    }
    
    // 发出提交事件给父组件（如果有的话）
    emits('submit', { ...event.value })
    
    // 跳转回事件列表页面
    router.push('/events')
  } catch (error) {
    console.error('保存事件失败:', error)
    alert('保存事件失败: ' + (error.message || '未知错误'))
  } finally {
    // 重置提交状态
    isSubmitting.value = false
  }
}

// 取消操作
const handleCancel = () => {
  // 发出取消事件给父组件（如果有的话）
  emits('cancel')
  // 跳转回事件列表页面
  router.push('/events')
}

// 事件类型变化处理
const onTypeChange = () => {
  // 可以在这里添加事件类型变化的逻辑
}
</script>

<style scoped>
.event-form {
  padding: 20px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.radio-item input[type="radio"] {
  margin-right: 5px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}
</style>