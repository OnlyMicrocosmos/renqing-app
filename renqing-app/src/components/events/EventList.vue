<template>
  <div class="event-list">
    <div v-if="loading" class="loading">
      <i class="icon-loading"></i>
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      <i class="icon-error"></i>
      {{ error }}
      <Button @click="$emit('reload')" variant="text" size="sm">
        重新加载
      </Button>
    </div>
    
    <div v-else-if="events.length === 0" class="empty-state">
      <i class="icon-empty"></i>
      <p>暂无事件记录</p>
      <Button @click="$emit('add-event')" variant="primary">
        添加第一个事件
      </Button>
    </div>
    
    <div v-else>
      <div class="list-header">
        <div class="header-item description">事件描述</div>
        <div class="header-item contact">联系人</div>
        <div class="header-item amount">金额</div>
        <div class="header-item date">日期</div>
        <div class="header-item actions">操作</div>
      </div>
      
      <div class="event-items">
        <div 
          v-for="event in filteredEvents" 
          :key="event.id" 
          class="event-item"
          :class="{'highlight': isRecentEvent(event.date)}"
        >
          <div class="item-cell description">
            <div class="event-type" :class="event.type">
              <i :class="typeIcon(event.type)"></i>
              {{ event.type === 'given' ? '送礼' : '收礼' }}
            </div>
            <div class="event-title">{{ event.description }}</div>
            <div v-if="event.notes" class="event-notes">
              {{ event.notes }}
            </div>
          </div>
          
          <div class="item-cell contact">
            <div class="contact-info">
              <div class="contact-avatar">
                {{ contactInitials(event.contactName) }}
              </div>
              <div class="contact-details">
                <div class="contact-name">{{ event.contactName }}</div>
                <div v-if="event.contactPhone" class="contact-phone">
                  {{ event.contactPhone }}
                </div>
              </div>
            </div>
          </div>
          
          <div class="item-cell amount" :class="event.type">
            {{ event.type === 'given' ? '-' : '+' }}{{ formatCurrency(event.value) }}
          </div>
          
          <div class="item-cell date">
            <div class="date-display">{{ formatDate(event.date) }}</div>
            <div class="relative-date">{{ relativeDate(event.date) }}</div>
          </div>
          
          <div class="item-cell actions">
            <Button 
              @click="$emit('edit', event)" 
              variant="text" 
              size="sm"
              class="action-btn"
            >
              <i class="icon-edit"></i>
            </Button>
            <Button 
              @click="$emit('delete', event.id)" 
              variant="text" 
              size="sm"
              class="action-btn"
            >
              <i class="icon-trash"></i>
            </Button>
            <Button 
              v-if="event.notes" 
              @click="toggleNotes(event.id)" 
              variant="text" 
              size="sm"
              class="action-btn"
            >
              <i :class="expandedNotes[event.id] ? 'icon-chevron-up' : 'icon-chevron-down'"></i>
            </Button>
          </div>
          
          <div 
            v-if="expandedNotes[event.id] && event.notes" 
            class="notes-expanded"
          >
            <div class="notes-label">备注：</div>
            <div class="notes-content">{{ event.notes }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="totalPages > 1" class="pagination">
        <Button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          variant="outline"
          size="sm"
        >
          上一页
        </Button>
        
        <div class="page-info">
          第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
        </div>
        
        <Button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          variant="outline"
          size="sm"
        >
          下一页
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatDate, relativeDate } from '@/utils/date'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  events: {
    type: Array,
    required: true,
    default: () => []
  },
  loading: Boolean,
  error: String,
  itemsPerPage: {
    type: Number,
    default: 10
  },
  sortBy: {
    type: String,
    default: 'date' // 'date', 'amount', 'contact'
  },
  sortOrder: {
    type: String,
    default: 'desc' // 'asc', 'desc'
  },
  filterType: {
    type: String,
    default: '' // 'given', 'received', ''
  }
})

const emit = defineEmits(['edit', 'delete', 'reload', 'add-event'])

const currentPage = ref(1)
const expandedNotes = ref({})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(props.events.length / props.itemsPerPage)
})

// 格式化后的数据
const filteredEvents = computed(() => {
  let result = [...props.events]
  
  // 应用类型过滤
  if (props.filterType) {
    result = result.filter(event => event.type === props.filterType)
  }
  
  // 应用排序
  result.sort((a, b) => {
    let comparison = 0
    
    switch (props.sortBy) {
      case 'amount':
        comparison = a.value - b.value
        break
      case 'contact':
        comparison = (a.contactName || '').localeCompare(b.contactName || '')
        break
      case 'date':
      default:
        comparison = new Date(a.date) - new Date(b.date)
    }
    
    return props.sortOrder === 'desc' ? -comparison : comparison
  })
  
  // 应用分页
  const startIndex = (currentPage.value - 1) * props.itemsPerPage
  return result.slice(startIndex, startIndex + props.itemsPerPage)
})

// 切换备注展开状态
const toggleNotes = (eventId) => {
  expandedNotes.value = {
    ...expandedNotes.value,
    [eventId]: !expandedNotes.value[eventId]
  }
}

// 上一页
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

// 下一页
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToTop()
  }
}

// 滚动到列表顶部
const scrollToTop = () => {
  const listContainer = document.querySelector('.event-items')
  if (listContainer) {
    listContainer.scrollTop = 0
  }
}

// 获取事件类型图标
const typeIcon = (type) => {
  return type === 'given' ? 'icon-gift' : 'icon-hand-coin'
}

// 获取联系人首字母
const contactInitials = (name) => {
  if (!name) return ''
  const names = name.split(' ')
  return names.map(n => n[0]).join('').toUpperCase()
}

// 判断是否为近期事件（7天内）
const isRecentEvent = (dateString) => {
  const eventDate = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - eventDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

// 监听事件数据变化重置分页
onMounted(() => {
  if (props.events.length > 0) {
    currentPage.value = 1
  }
})
</script>

<style scoped>
.event-list {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.loading, .error, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.loading i, .error i, .empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--light-gray);
}

.error i {
  color: var(--danger);
}

.loading i {
  animation: spin 1s linear infinite;
  color: var(--primary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  color: var(--danger);
}

.empty-state p {
  color: var(--gray);
  margin: 1rem 0;
}

.list-header {
  display: flex;
  padding: 1rem 1.5rem;
  background-color: var(--light);
  border-bottom: 1px solid var(--light-gray);
  font-weight: 600;
  color: var(--dark);
}

.header-item {
  padding: 0 0.5rem;
}

.header-item.description {
  flex: 3;
}

.header-item.contact {
  flex: 2;
}

.header-item.amount {
  flex: 1;
  text-align: right;
}

.header-item.date {
  flex: 1.5;
}

.header-item.actions {
  flex: 1;
  text-align: center;
}

.event-items {
  max-height: 600px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--light-gray);
  transition: background-color 0.2s;
}

.event-item:hover {
  background-color: #f8fafc;
}

.event-item.highlight {
  background-color: rgba(255, 246, 178, 0.3);
  border-left: 3px solid var(--warning);
}

.item-cell {
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.item-cell.description {
  flex: 3;
}

.item-cell.contact {
  flex: 2;
}

.item-cell.amount {
  flex: 1;
  text-align: right;
  font-weight: 600;
  font-size: 1.1rem;
}

.item-cell.amount.given {
  color: var(--danger);
}

.item-cell.amount.received {
  color: var(--success);
}

.item-cell.date {
  flex: 1.5;
}

.item-cell.actions {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.25rem;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
}

.event-type.given {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.event-type.received {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.event-title {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.event-notes {
  font-size: 0.875rem;
  color: var(--gray);
  margin-top: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.contact-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.contact-name {
  font-weight: 500;
}

.contact-phone {
  font-size: 0.875rem;
  color: var(--gray);
}

.date-display {
  font-weight: 500;
}

.relative-date {
  font-size: 0.875rem;
  color: var(--gray);
}

.notes-expanded {
  grid-column: 1 / -1;
  background-color: #f8fafc;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 3px solid var(--primary);
}

.notes-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--primary);
}

.notes-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--light-gray);
}

.page-info {
  color: var(--gray);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .list-header {
    display: none;
  }
  
  .event-item {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .item-cell {
    padding: 0.25rem 0;
  }
  
  .item-cell.amount {
    text-align: left;
  }
  
  .item-cell.actions {
    justify-content: flex-end;
    margin-top: 0.5rem;
  }
  
  .contact-info {
    justify-content: space-between;
  }
  
  .event-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>