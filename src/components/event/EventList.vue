<template>
  <div class="event-list">
    <rq-card header="人情往来记录">
      <div class="event-list__header">
        <div class="event-list__header-item">事件</div>
        <div class="event-list__header-item">对象</div>
        <div class="event-list__header-item">金额</div>
        <div class="event-list__header-item">日期</div>
        <div class="event-list__header-item">操作</div>
      </div>
      
      <div 
        v-for="event in events" 
        :key="event.id" 
        class="event-list__item"
      >
        <div class="event-list__item-name">{{ event.name }}</div>
        <div class="event-list__item-person">{{ event.person }}</div>
        <div 
          class="event-list__item-amount" 
          :class="event.type === 'income' ? 'income' : 'expense'"
        >
          {{ event.type === 'income' ? '+' : '-' }}{{ event.amount }}
        </div>
        <div class="event-list__item-date">{{ formatDate(event.date) }}</div>
        <div class="event-list__item-actions">
          <rq-button 
            type="primary" 
            size="small" 
            @click="editEvent(event)"
          >
            编辑
          </rq-button>
          <rq-button 
            type="danger" 
            size="small" 
            @click="deleteEvent(event.id)"
          >
            删除
          </rq-button>
        </div>
      </div>
      
      <div v-if="events.length === 0" class="event-list__empty">
        暂无记录
      </div>
    </rq-card>
  </div>
</template>

<script>
import RQCard from '@/components/ui/RQCard.vue'
import RQButton from '@/components/ui/RQButton.vue'

export default {
  name: 'EventList',
  components: {
    RQCard,
    RQButton
  },
  props: {
    events: {
      type: Array,
      default: () => []
    }
  },
  emits: ['edit', 'delete'],
  methods: {
    formatDate(date) {
      if (!date) return ''
      const d = new Date(date)
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
    },
    
    editEvent(event) {
      this.$emit('edit', event)
    },
    
    deleteEvent(id) {
      this.$emit('delete', id)
    }
  }
}
</script>

<style scoped>
.event-list {
  width: 100%;
}

.event-list__header {
  display: flex;
  justify-content: space-between;
  padding: var(--spacer-sm) var(--spacer-md);
  background-color: var(--background-color-light);
  font-weight: bold;
  border-bottom: 1px solid var(--border-color-base);
}

.event-list__header-item {
  flex: 1;
  text-align: center;
}

.event-list__item {
  display: flex;
  align-items: center;
  padding: var(--spacer-sm) var(--spacer-md);
  border-bottom: 1px solid var(--border-color-base);
}

.event-list__item:last-child {
  border-bottom: none;
}

.event-list__item > div {
  flex: 1;
  text-align: center;
}

.event-list__item-amount.income {
  color: var(--success-color);
}

.event-list__item-amount.expense {
  color: var(--danger-color);
}

.event-list__item-actions {
  display: flex;
  gap: var(--spacer-xs);
  justify-content: center;
}

.event-list__empty {
  text-align: center;
  padding: var(--spacer-lg);
  color: var(--text-color-secondary);
}
</style>