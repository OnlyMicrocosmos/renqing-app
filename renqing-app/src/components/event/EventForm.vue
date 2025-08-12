<template>
  <div class="event-form">
    <rq-card :header="formTitle">
      <form @submit.prevent="handleSubmit">
        <div class="event-form__group">
          <label class="event-form__label">事件类型</label>
          <div class="event-form__radio-group">
            <label class="event-form__radio-item">
              <input 
                type="radio" 
                v-model="form.type" 
                value="income"
              >
              <span>收入</span>
            </label>
            <label class="event-form__radio-item">
              <input 
                type="radio" 
                v-model="form.type" 
                value="expense"
              >
              <span>支出</span>
            </label>
          </div>
        </div>
        
        <div class="event-form__group">
          <label class="event-form__label" for="eventName">事件名称</label>
          <rq-input
            id="eventName"
            v-model="form.name"
            placeholder="请输入事件名称，如：结婚礼金、生日礼物等"
          />
        </div>
        
        <div class="event-form__group">
          <label class="event-form__label" for="eventPerson">涉及对象</label>
          <rq-input
            id="eventPerson"
            v-model="form.person"
            placeholder="请输入涉及对象，如：张三、李四等"
          />
        </div>
        
        <div class="event-form__group">
          <label class="event-form__label" for="eventAmount">金额</label>
          <rq-input
            id="eventAmount"
            v-model.number="form.amount"
            type="number"
            placeholder="请输入金额"
          />
        </div>
        
        <div class="event-form__group">
          <label class="event-form__label" for="eventDate">日期</label>
          <rq-input
            id="eventDate"
            v-model="form.date"
            type="date"
          />
        </div>
        
        <div class="event-form__actions">
          <rq-button 
            type="primary" 
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交' }}
          </rq-button>
          <rq-button 
            type="default" 
            @click="handleCancel"
          >
            取消
          </rq-button>
        </div>
      </form>
    </rq-card>
  </div>
</template>

<script>
import RQCard from '@/components/ui/RQCard.vue'
import RQInput from '@/components/ui/RQInput.vue'
import RQButton from '@/components/ui/RQButton.vue'

export default {
  name: 'EventForm',
  components: {
    RQCard,
    RQInput,
    RQButton
  },
  props: {
    event: {
      type: Object,
      default: () => ({
        id: null,
        type: 'expense', // income 或 expense
        name: '',
        person: '',
        amount: null,
        date: ''
      })
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: { ...this.event }
    }
  },
  computed: {
    formTitle() {
      return this.form.id ? '编辑记录' : '添加记录'
    }
  },
  watch: {
    event: {
      handler(newVal) {
        this.form = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      // 表单验证
      if (!this.form.name || !this.form.person || !this.form.amount || !this.form.date) {
        alert('请填写完整信息')
        return
      }
      
      if (this.form.amount <= 0) {
        alert('金额必须大于0')
        return
      }
      
      this.$emit('submit', { ...this.form })
    },
    
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style scoped>
.event-form {
  width: 100%;
}

.event-form__group {
  margin-bottom: var(--spacer-md);
}

.event-form__label {
  display: block;
  margin-bottom: var(--spacer-sm);
  font-weight: bold;
  color: var(--text-color-primary);
}

.event-form__radio-group {
  display: flex;
  gap: var(--spacer-lg);
}

.event-form__radio-item {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.event-form__radio-item input {
  margin-right: var(--spacer-xs);
  cursor: pointer;
}

.event-form__actions {
  display: flex;
  gap: var(--spacer-md);
  justify-content: center;
  margin-top: var(--spacer-lg);
}

@media (max-width: 768px) {
  .event-form__radio-group {
    gap: var(--spacer-md);
  }
  
  .event-form__actions {
    flex-direction: column;
  }
}
</style>