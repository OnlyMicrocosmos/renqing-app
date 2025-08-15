<template>
  <div
    class="rq-card"
    :class="[
      shadow ? `rq-card--shadow-${shadow}` : '',
      { 'is-always-shadow': alwaysShadow }
    ]"
  >
    <div 
      v-if="$slots.header || header" 
      class="rq-card__header"
    >
      <slot name="header">{{ header }}</slot>
    </div>
    <div class="rq-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RQCard',
  props: {
    header: {
      type: String,
      default: ''
    },
    shadow: {
      type: String,
      default: 'always',
      validator: function (value) {
        return ['always', 'hover', 'never'].includes(value)
      }
    },
    alwaysShadow: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.rq-card {
  border-radius: var(--border-radius-base);
  border: 1px solid var(--border-color-base);
  background-color: var(--white-color);
  color: var(--text-color-primary);
  transition: all 0.3s;
  overflow: hidden;
}

.rq-card--shadow-always {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.rq-card--shadow-hover {
  box-shadow: none;
}

.rq-card--shadow-hover:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.rq-card.is-always-shadow {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.rq-card__header {
  padding: var(--spacer-md);
  border-bottom: 1px solid var(--border-color-base);
  box-sizing: border-box;
}

.rq-card__body {
  padding: var(--spacer-md);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .rq-card__header {
    padding: var(--spacer-sm);
  }
  
  .rq-card__body {
    padding: var(--spacer-sm);
  }
}
</style>