<template>
  <div class="contact-card">
    <rq-card>
      <div class="contact-card__header">
        <div class="contact-card__avatar">
          {{ contactInitial }}
        </div>
        <div class="contact-card__info">
          <h3 class="contact-card__name">{{ contact.name }}</h3>
          <p class="contact-card__relation">{{ contact.relation }}</p>
        </div>
        <div class="contact-card__actions">
          <rq-button 
            type="primary" 
            size="small" 
            @click="editContact"
          >
            编辑
          </rq-button>
          <rq-button 
            type="danger" 
            size="small" 
            @click="deleteContact"
          >
            删除
          </rq-button>
        </div>
      </div>
      
      <div class="contact-card__body">
        <div class="contact-card__detail">
          <div class="contact-card__detail-item">
            <span class="contact-card__detail-label">电话:</span>
            <span class="contact-card__detail-value">{{ contact.phone || '未填写' }}</span>
          </div>
          <div class="contact-card__detail-item">
            <span class="contact-card__detail-label">邮箱:</span>
            <span class="contact-card__detail-value">{{ contact.email || '未填写' }}</span>
          </div>
          <div class="contact-card__detail-item">
            <span class="contact-card__detail-label">地址:</span>
            <span class="contact-card__detail-value">{{ contact.address || '未填写' }}</span>
          </div>
          <div class="contact-card__detail-item">
            <span class="contact-card__detail-label">备注:</span>
            <span class="contact-card__detail-value">{{ contact.note || '无' }}</span>
          </div>
        </div>
        
        <div class="contact-card__summary">
          <div class="contact-card__summary-item">
            <span class="contact-card__summary-label">总支出:</span>
            <span class="contact-card__summary-value expense">¥{{ totalExpense }}</span>
          </div>
          <div class="contact-card__summary-item">
            <span class="contact-card__summary-label">总收入:</span>
            <span class="contact-card__summary-value income">¥{{ totalIncome }}</span>
          </div>
          <div class="contact-card__summary-item">
            <span class="contact-card__summary-label">净收支:</span>
            <span 
              class="contact-card__summary-value" 
              :class="netAmount >= 0 ? 'income' : 'expense'"
            >
              ¥{{ netAmount }}
            </span>
          </div>
        </div>
      </div>
    </rq-card>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useEventStore } from '@/stores/event.store'
import RQCard from '@/components/ui/RQCard.vue'
import RQButton from '@/components/ui/RQButton.vue'

export default {
  name: 'ContactCard',
  components: {
    RQCard,
    RQButton
  },
  props: {
    contact: {
      type: Object,
      required: true,
      default: () => ({
        id: null,
        name: '',
        relation: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        events: []
      })
    }
  },
  computed: {
    ...mapState(useEventStore, ['events']),
    
    contactInitial() {
      return this.contact.name ? this.contact.name.charAt(0) : '?'
    },
    
    contactEvents() {
      // 从事件存储中过滤出与当前联系人相关的事件
      return this.events.filter(event => event.contactId === this.contact.id)
    },
    
    totalExpense() {
      return this.contactEvents
        .filter(event => event.type === 'given')
        .reduce((sum, event) => sum + (event.amount || 0), 0)
        .toFixed(2)
    },
    
    totalIncome() {
      return this.contactEvents
        .filter(event => event.type === 'received')
        .reduce((sum, event) => sum + (event.amount || 0), 0)
        .toFixed(2)
    },
    
    netAmount() {
      return (parseFloat(this.totalIncome) - parseFloat(this.totalExpense)).toFixed(2)
    }
  },
  methods: {
    editContact() {
      this.$emit('edit', this.contact)
    },
    
    deleteContact() {
      this.$emit('delete', this.contact.id)
    }
  }
}
</script>

<style scoped>
.contact-card {
  width: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.contact-card__header {
  display: flex;
  align-items: center;
  padding: var(--spacer-md);
  border-bottom: 1px solid var(--border-color-base);
}

.contact-card__avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #6a5acd);
  color: var(--white-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  margin-right: var(--spacer-md);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.contact-card__info {
  flex: 1;
}

.contact-card__name {
  margin: 0 0 var(--spacer-xs);
  font-size: 18px;
  color: var(--text-color-primary);
  font-weight: 600;
}

.contact-card__relation {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary);
  background-color: var(--light);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.contact-card__actions {
  display: flex;
  gap: var(--spacer-sm);
}

.contact-card__actions button {
  padding: 6px 12px;
  font-size: 14px;
}

.contact-card__body {
  padding: var(--spacer-md);
}

.contact-card__detail {
  margin-bottom: var(--spacer-lg);
}

.contact-card__detail-item {
  display: flex;
  margin-bottom: var(--spacer-sm);
  padding: 4px 0;
}

.contact-card__detail-label {
  width: 60px;
  font-weight: 600;
  color: var(--text-color-primary);
}

.contact-card__detail-value {
  flex: 1;
  color: var(--text-color-secondary);
  word-break: break-all;
}

.contact-card__summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacer-md);
  padding: var(--spacer-md);
  background-color: var(--background-color-light);
  border-radius: var(--border-radius);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.contact-card__summary-item {
  text-align: center;
}

.contact-card__summary-label {
  display: block;
  font-size: 14px;
  color: var(--text-color-secondary);
  margin-bottom: var(--spacer-xs);
  font-weight: 500;
}

.contact-card__summary-value {
  font-size: 18px;
  font-weight: 700;
}

.contact-card__summary-value.income {
  color: var(--success-color);
}

.contact-card__summary-value.expense {
  color: var(--danger-color);
}

@media (max-width: 768px) {
  .contact-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .contact-card__avatar {
    margin-right: 0;
    margin-bottom: var(--spacer-sm);
  }
  
  .contact-card__info {
    margin-bottom: var(--spacer-md);
    width: 100%;
    text-align: center;
  }
  
  .contact-card__relation {
    margin: 0 auto var(--spacer-sm);
  }
  
  .contact-card__actions {
    align-self: flex-end;
    width: 100%;
    justify-content: center;
  }
  
  .contact-card__summary {
    grid-template-columns: 1fr;
  }
}
</style>