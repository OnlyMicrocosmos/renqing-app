<template>
  <div class="contact-form">
    <div class="form-card">
      <h3>{{ formTitle }}</h3>
      <form @submit.prevent="handleSubmit">
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactName">姓名 *</label>
          <input
            id="contactName"
            v-model="form.name"
            type="text"
            placeholder="请输入联系人姓名"
            :disabled="isSubmitting"
            class="form-control"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactRelation">关系 *</label>
          <input
            id="contactRelation"
            v-model="form.relation"
            type="text"
            placeholder="请输入与联系人的关系，如：朋友、同事等"
            :disabled="isSubmitting"
            class="form-control"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactPhone">电话</label>
          <input
            id="contactPhone"
            v-model="form.phone"
            type="tel"
            placeholder="请输入联系人电话"
            :disabled="isSubmitting"
            class="form-control"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactEmail">邮箱</label>
          <input
            id="contactEmail"
            v-model="form.email"
            type="email"
            placeholder="请输入联系人邮箱"
            :disabled="isSubmitting"
            class="form-control"
          />
        </div>
        
        <div class="contact-form__group">
          <label class="contact-form__label" for="contactAddress">地址</label>
          <input
            id="contactAddress"
            v-model="form.address"
            type="text"
            placeholder="请输入联系人地址"
            :disabled="isSubmitting"
            class="form-control"
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
          <button 
            type="submit"
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '提交' }}
          </button>
          <button 
            type="button"
            class="btn btn-secondary"
            @click="handleCancel"
            :disabled="isSubmitting"
          >
            <i class="icon-close"></i> 取消
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 接收父组件传递的 contact 数据
const props = defineProps({
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
})

// 定义保存和取消事件
const emits = defineEmits(['submit', 'cancel'])

// 使用 v-model 双向绑定数据
const form = ref({ ...props.contact })

// 监听 contact 变化，同步到本地数据
watch(() => props.contact, (newVal) => {
  form.value = { ...newVal }
})

// 计算属性
const formTitle = computed(() => {
  return form.value.id ? '编辑联系人' : '添加联系人'
})

// 提交表单
const handleSubmit = () => {
  // 表单验证
  if (!form.value.name || !form.value.relation) {
    alert('请填写姓名和关系')
    return
  }
  
  // 邮箱格式验证（如果填写了邮箱）
  if (form.value.email && !isValidEmail(form.value.email)) {
    alert('请输入正确的邮箱格式')
    return
  }
  
  // 电话格式验证（如果填写了电话）
  if (form.value.phone && !isValidPhone(form.value.phone)) {
    alert('请输入正确的电话格式')
    return
  }
  
  // 发出提交事件
  emits('submit', { ...form.value })
}

// 取消操作
const handleCancel = () => {
  emits('cancel')
}

// 验证邮箱格式
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 验证电话格式
const isValidPhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
}
</script>

<style scoped>
.contact-form {
  width: 100%;
}

.form-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
}

.form-card h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--dark);
  text-align: center;
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

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color-base);
  border-radius: var(--border-radius);
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--light);
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
  flex-direction: column; /* 改为垂直排列 */
  gap: var(--spacer-md);
  justify-content: center;
  margin-top: var(--spacer-lg);
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 1rem;
  width: 100%; /* 按钮宽度100% */
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-primary {
  background-color: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.btn-secondary {
  background-color: var(--light-gray);
  color: var(--dark);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--gray);
}

/* 确保按钮在移动设备上也能正确显示 */
@media (min-width: 768px) {
  .contact-form__actions {
    flex-direction: row; /* 在较大屏幕上改为水平排列 */
  }
  
  .btn {
    width: auto; /* 在较大屏幕上恢复自动宽度 */
  }
}
</style>