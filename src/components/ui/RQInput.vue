<template>
  <input
    class="rq-input"
    :class="[
      size ? `rq-input--${size}` : '',
      {
        'is-disabled': disabled
      }
    ]"
    :disabled="disabled"
    :placeholder="placeholder"
    :value="modelValue"
    @input="handleInput"
    @focus="handleFocus"
    @blur="handleBlur"
  />
</template>

<script>
export default {
  name: 'RQInput',
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: 'default',
      validator: function (value) {
        return ['default', 'small', 'large'].includes(value)
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'input', 'focus', 'blur'],
  methods: {
    handleInput(event) {
      if (!this.disabled) {
        const value = event.target.value;
        this.$emit('update:modelValue', value);
        this.$emit('input', value);
      }
    },
    
    handleFocus(event) {
      if (!this.disabled) {
        this.$emit('focus', event);
      }
    },
    
    handleBlur(event) {
      if (!this.disabled) {
        this.$emit('blur', event);
      }
    }
  }
}
</script>

<style scoped>
.rq-input {
  display: inline-block;
  width: 100%;
  padding: var(--spacer-sm) var(--spacer-md);
  font-size: 14px;
  line-height: 1.5;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-base);
  background-color: var(--white-color);
  color: var(--text-color-primary);
  box-sizing: border-box;
  transition: all 0.3s;
}

.rq-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.rq-input::placeholder {
  color: var(--text-color-placeholder);
}

.rq-input.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background-color: var(--disabled-bg-color);
}

/* 输入框尺寸 */
.rq-input--small {
  padding: var(--spacer-xs) var(--spacer-sm);
  font-size: 12px;
}

.rq-input--large {
  padding: var(--spacer-md) var(--spacer-lg);
  font-size: 16px;
}
</style>