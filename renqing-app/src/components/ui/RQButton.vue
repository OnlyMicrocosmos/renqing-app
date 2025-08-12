<template>
  <button 
    :class="buttonClasses"
    :disabled="loading || disabled"
    @click="$emit('click')"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'outline', 'danger', 'success', 'text'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg'].includes(value)
  },
  loading: Boolean,
  disabled: Boolean,
  fullWidth: Boolean
})

const buttonClasses = computed(() => {
  const classes = ['btn']
  
  // 添加变体类
  if (props.variant === 'primary') classes.push('btn-primary')
  else if (props.variant === 'outline') classes.push('btn-outline')
  else if (props.variant === 'danger') classes.push('btn-danger')
  else if (props.variant === 'success') classes.push('btn-success')
  else if (props.variant === 'text') classes.push('btn-text')
  
  // 添加尺寸类
  if (props.size === 'sm') classes.push('btn-sm')
  else if (props.size === 'lg') classes.push('btn-lg')
  
  // 添加全宽类
  if (props.fullWidth) classes.push('btn-full')
  
  return classes.join(' ')
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--border-radius);
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-align: center;
  text-decoration: none;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-2px);
}

.btn-primary {
  background-color: var(--primary);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(74, 108, 247, 0.3), 0 2px 4px -1px rgba(74, 108, 247, 0.2);
}

.btn-primary:hover {
  background-color: var(--primary-dark);
  box-shadow: 0 10px 15px -3px rgba(74, 108, 247, 0.3), 0 4px 6px -2px rgba(74, 108, 247, 0.2);
}

.btn-outline {
  background-color: transparent;
  border: 2px solid var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background-color: var(--primary-light);
}

.btn-danger {
  background-color: var(--danger);
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-success {
  background-color: var(--success);
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-text {
  background-color: transparent;
  color: var(--primary);
  padding: 0.5rem;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-full {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.spinner {
  display: inline-block;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>