<template>
  <div class="event-view">
    <div class="page-header flex-between">
      <div>
        <h1>事件管理</h1>
        <p>记录和管理您的人情往来事件</p>
      </div>
      <router-link to="/events/add" class="btn">
        <i class="icon-plus"></i> 添加事件
      </router-link>
    </div>

    <div class="filters">
      <div class="filter-group">
        <label>事件类型</label>
        <select v-model="filter.type">
          <option value="">全部</option>
          <option value="given">送礼</option>
          <option value="received">收礼</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>联系人</label>
        <select v-model="filter.contactId">
          <option value="">全部联系人</option>
          <option v-for="contact in contacts" :key="contact.id" :value="contact.id">
            {{ contact.name }}
          </option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>日期范围</label>
        <div class="date-range">
          <input type="date" v-model="filter.startDate">
          <span>至</span>
          <input type="date" v-model="filter.endDate">
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="filteredEvents.length === 0" class="empty-state">
      <i class="icon-empty"></i>
      <p>没有找到匹配的事件</p>
      <router-link to="/events/add" class="btn">添加第一个事件</router-link>
    </div>
    <EventList v-else :events="filteredEvents" @edit="handleEdit" @delete="handleDelete" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEventStore } from '@/stores/event.store'
import { useContactStore } from '@/stores/contact.store'
import EventList from '@/components/events/EventList.vue' // 确认路径正确

export default {
  name: 'EventView',
  components: {
    EventList
  },
  setup() {
    const eventStore = useEventStore()
    const contactStore = useContactStore()

    const events = ref([])
    const contacts = ref([])
    const loading = ref(true)
    const error = ref(null)

    const filter = ref({
      type: '',
      contactId: '',
      startDate: '',
      endDate: ''
    })

    onMounted(async () => {
      try {
        await contactStore.loadContacts()
        contacts.value = contactStore.contacts
    
        await eventStore.loadEvents()
        events.value = eventStore.events
      } catch (err) {
        error.value = err.message || '加载数据失败'
      } finally {
        loading.value = false
      }
    })

    const filteredEvents = computed(() => {
      return events.value.filter(event => {
        // 过滤类型
        if (filter.value.type && event.type !== filter.value.type) {
          return false
        }
        
        // 过滤联系人
        if (filter.value.contactId && event.contactId != filter.value.contactId) {
          return false
        }
        
        // 过滤日期范围
        if (filter.value.startDate && event.date < filter.value.startDate) {
          return false
        }
        
        if (filter.value.endDate && event.date > filter.value.endDate) {
          return false
        }
        
        return true
      })
    })

    const handleEdit = (event) => {
      eventStore.setCurrentEvent(event)
    }

    const handleDelete = async (eventId) => {
      if (confirm('确定要删除这个事件吗？此操作不可撤销。')) {
        const success = await eventStore.deleteEvent(eventId)
        if (success) {
          events.value = eventStore.events
        }
      }
    }

    return {
      events,
      contacts,
      loading,
      error,
      filter,
      filteredEvents,
      handleEdit,
      handleDelete
    }
  }
}

</script>

<style scoped>
.event-view {
  padding-bottom: 40px;
}

.page-header {
  margin-bottom: 30px;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  padding: 20px;
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.filter-group select,
.filter-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: var(--border-radius);
  font-size: 1rem;
}

.date-range {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-range span {
  color: var(--gray);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
}

.empty-state i {
  font-size: 3rem;
  color: #e0e0e0;
  margin-bottom: 20px;
}

.empty-state p {
  margin-bottom: 20px;
  color: var(--gray);
}

.loading, .error {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  font-size: 1.1rem;
}

.error {
  color: var(--danger);
}
</style>