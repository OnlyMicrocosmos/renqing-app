<template>
  <div class="contact-form">
    <rq-card :header="formTitle">
      <form @submit.prevent="handleSubmit">
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactName">姓名 *</label>
          <rq-input
            id="contactName"
            v-model="form.name"
            placeholder="请输入联系人姓名"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactRelation">关系 *</label>
          <rq-input
            id="contactRelation"
            v-model="form.relation"
            placeholder="请输入与联系人的关系，如：朋友、同事等"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactPhone">电话</label>
          <rq-input
            id="contactPhone"
            v-model="form.phone"
            type="tel"
            placeholder="请输入联系人电话"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactEmail">邮箱</label>
          <rq-input
            id="contactEmail"
            v-model="form.email"
            type="email"
            placeholder="请输入联系人邮箱"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactAddress">地址</label>
          <rq-input
            id="contactAddress"
            v-model="form.address"
            placeholder="请输入联系人地址"
            :disabled="isSubmitting"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactNote">备注</label>
          <textarea
            id="contactNote"
            class="contact-form__textarea"
            v-model="form.note"
            placeholder="请输入备注信息"
            :disabled="isSubmitting"
          ></textarea>
        </div>
        
        <div class="contact-form__actions">
          <rq-button 
            type="primary" 
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交' }}
          </rq-button>
          <rq-button 
            type="default" 
            @click="handleCancel"
            :disabled="isSubmitting"
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
  name: 'ContactForm',
  components: {
    RQCard,
    RQInput,
    RQButton
  },
  props: {
    contact: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        relation: '',
        phone: '',
        email: '',
        address: '',
        note: ''
      })
    },
    isSubmitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: { ...this.contact }
    }
  },
  computed: {
    formTitle() {
      return this.form.id ? '编辑联系人' : '添加联系人'
    }
  },
  watch: {
    contact: {
      handler(newVal) {
        this.form = { ...newVal }
      },
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      // 表单验证
      if (!this.form.name || !this.form.relation) {
        alert('请填写姓名和关系')
        return
      }
      
      // 邮箱格式验证（如果填写了邮箱）
      if (this.form.email && !this.isValidEmail(this.form.email)) {
        alert('请输入正确的邮箱格式')
        return
      }
      
      // 电话格式验证（如果填写了电话）
      if (this.form.phone && !this.isValidPhone(this.form.phone)) {
        alert('请输入正确的电话格式')
        return
      }
      
      this.$emit('submit', { ...this.form })
    },
    
    handleCancel() {
      this.$emit('cancel')
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    isValidPhone(phone) {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(phone)
    }
  }
}
</script>

<style scoped>
.contact-form {
  width: 100%;
}

.contact-form__group {
  margin-bottom: var(--spacer-md);
}

.contact-form__label {
  display: block;
  margin-bottom: var(--spacer-sm);
  font-weight: bold;
  color: var(--text-color-primary);
}

.contact-form__textarea {
  width: 100%;
  min-height: 100px;
  padding: var(--spacer-sm);
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-base);
  background-color: var(--white-color);
  color: var(--text-color-primary);
  font-family: inherit;
  font-size: 14px;
  box-sizing: border-box;
  resize: vertical;
}

.contact-form__textarea:focus {
  outline: none;
  border-color: var(--primary-color);
}

.contact-form__textarea:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--disabled-bg-color);
}

.contact-form__actions {
  display: flex;
  gap: var(--spacer-md);
  justify-content: center;
  margin-top: var(--spacer-lg);
}

@media (max-width: 768px) {
  .contact-form__actions {
    flex-direction: column;
  }
}
</style>