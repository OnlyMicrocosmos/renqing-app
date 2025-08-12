<template>
  <button 
    class="rq-button" 
    :class="[
      type ? `rq-button--${type}` : '',
      size ? `rq-button--${size}` : '',
      {
        'is-plain': plain,
        'is-round': round,
        'is-disabled': disabled
      }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'RQButton',
  props: {
    type: {
      type: String,
      default: 'default',
      validator: function (value) {
        return ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
      }
    },
    size: {
      type: String,
      default: 'default',
      validator: function (value) {
        return ['default', 'small', 'large'].includes(value)
      }
    },
    plain: {
      type: Boolean,
      default: false
    },
    round: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.rq-button {
  display: inline-block;
  padding: var(--spacer-sm) var(--spacer-md);
  font-size: 14px;
  line-height: 1.5;
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-base);
  cursor: pointer;
  transition: all 0.3s;
  background-color: var(--white-color);
  color: var(--text-color-primary);
  white-space: nowrap;
  outline: none;
}

.rq-button:hover {
  opacity: 0.8;
}

.rq-button:focus {
  outline: none;
}

.rq-button:active {
  opacity: 1;
}

.rq-button.is-disabled,
.rq-button.is-disabled:hover,
.rq-button.is-disabled:active {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 按钮类型 */
.rq-button--primary {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: var(--white-color);
}

.rq-button--success {
  background-color: var(--success-color);
  border-color: var(--success-color);
  color: var(--white-color);
}

.rq-button--warning {
  background-color: var(--warning-color);
  border-color: var(--warning-color);
  color: var(--white-color);
}

.rq-button--danger {
  background-color: var(--danger-color);
  border-color: var(--danger-color);
  color: var(--white-color);
}

/* 朴素按钮 */
.rq-button--primary.is-plain {
  background-color: var(--white-color);
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.rq-button--success.is-plain {
  background-color: var(--white-color);
  border-color: var(--success-color);
  color: var(--success-color);
}

.rq-button--warning.is-plain {
  background-color: var(--white-color);
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.rq-button--danger.is-plain {
  background-color: var(--white-color);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

/* 按钮尺寸 */
.rq-button--small {
  padding: var(--spacer-xs) var(--spacer-sm);
  font-size: 12px;
}

.rq-button--large {
  padding: var(--spacer-md) var(--spacer-lg);
  font-size: 16px;
}

/* 圆角按钮 */
.rq-button--round {
  border-radius: 20px;
}
</style>