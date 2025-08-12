<template>
  <div class="form-group">
    <label v-if="label" :for="id">{{ label }}</label>
    <div class="input-container" :class="{ 'has-icon': $slots.prefix || $slots.suffix }">
      <div v-if="$slots.prefix" class="input-prefix">
        <slot name="prefix"></slot>
      </div>
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        @input="$emit('update:modelValue', $event.target.value)"
        class="form-control"
        :class="{ 'has-error': error }"
      />
      <div v-if="$slots.suffix" class="input-suffix">
        <slot name="suffix"></slot>
      </div>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  id: String,
  type: {
    type: String,
    default: 'text'
  },
  placeholder: String,
  error: String,
  hint: String,
  disabled: Boolean,
  readonly: Boolean
})

defineEmits(['update:modelValue'])

// 如果没有提供id，自动生成一个
const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark);
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-container.has-icon .form-control {
  padding-left: 2.5rem;
}

.input-prefix, .input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  z-index: 10;
}

.input-prefix {
  left: 1rem;
}

.input-suffix {
  right: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  font-size: 1rem;
  transition: var(--transition);
  background-color: white;
}

.form-control:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 3px rgba(74, 108, 247, 0.2);
}

.form-control.has-error {
  border-color: var(--danger);
}

.form-control.has-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.error-message {
  margin-top: 0.5rem;
  color: var(--danger);
  font-size: 0.875rem;
}

.hint {
  margin-top: 0.5rem;
  color: var(--gray);
  font-size: 0.875rem;
}
</style>