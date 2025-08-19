<template>
  <div class="event-list">
    <table class="table">
      <thead>
        <tr>
          <th>事件描述</th>
          <th>联系人</th>
          <th>金额</th>
          <th>日期</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="event in events" :key="event.id">
          <td>
            <div class="event-type-badge" :class="event.type === 'given' ? 'given' : 'received'">
              {{ event.type === 'given' ? '送礼' : '收礼' }}
            </div>
            <div class="event-description">{{ event.description }}</div>
            <div class="event-notes" v-if="event.notes">{{ event.notes }}</div>
          </td>
          <td>
            <span>{{ contactName(event.contactId) }}</span>
          </td>
          <td>
            <span :class="event.amount >= 0 ? 'positive' : 'negative'">
              {{ event.amount >= 0 ? '+' : '-' }}¥{{ event.amount.toFixed(2) }}
            </span>
          </td>
          <td>
            <div>{{ event.date }}</div>
            <div class="time-ago">{{ timeAgo(event.date) }}</div>
          </td>
          <td class="actions">
            <!-- 编辑按钮 -->
            <button class="btn btn-sm btn-primary" @click="handleEdit(event)">
              <i class="icon-edit"></i>
            </button>
            <!-- 删除按钮 -->
            <button class="btn btn-sm btn-danger" @click="handleDelete(event.id)">
              <i class="icon-delete"></i>
            </button>
            <!-- 显示备注按钮 -->
            <button class="btn btn-sm btn-info" @click="showNotes(event)">
              <i class="icon-note"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 备注模态框 -->
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>备注</h3>
        <p>{{ currentEvent.notes }}</p>
        <button class="btn btn-secondary" @click="closeModal">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useContactStore } from '@/stores/contact.store'

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
})

const emits = defineEmits(['edit', 'delete'])

const contactStore = useContactStore()

// 获取联系人姓名
const contactName = (contactId) => {
  const contact = contactStore.contacts.find(c => c.id === contactId)
  return contact ? contact.name : '无'
}

// 时间格式化
const timeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffTime = now - date
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays < 7) {
    return `${diffDays}天前`
  } else {
    return `${diffDays}天前`
  }
}

// 编辑事件
const handleEdit = (event) => {
  emits('edit', event)
}

// 删除事件
const handleDelete = async (eventId) => {
  if (confirm('确定要删除这个事件吗？此操作不可撤销。')) {
    await emits('delete', eventId)
  }
}

// 显示备注
const showModal = ref(false)
const currentEvent = ref(null)

const showNotes = (event) => {
  currentEvent.value = event
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}
</script>

<style scoped>
.event-list {
  margin-top: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: var(--shadow);
  border-radius: var(--border-radius);
}

.table th,
.table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.table tr:last-child td {
  border-bottom: none;
}

.event-type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-bottom: 4px;
}

.event-type-badge.given {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.event-type-badge.received {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.event-description {
  font-weight: 500;
}

.event-notes {
  color: #666;
  font-size: 0.9rem;
}

.positive {
  color: #2e7d32;
}

.negative {
  color: #c62828;
}

.time-ago {
  color: #666;
  font-size: 0.9rem;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-primary {
  background-color: #2196f3;
  color: white;
}

.btn-danger {
  background-color: #f44336;
  color: white;
}

.btn-info {
  background-color: #2196f3;
  color: white;
}

.modal {
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
  padding: 20px;
  border-radius: var(--border-radius);
  max-width: 400px;
  width: 90%;
  box-shadow: var(--shadow);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.modal-content p {
  margin: 0;
  color: #666;
}

.modal-content .btn {
  margin-top: 10px;
}
</style>