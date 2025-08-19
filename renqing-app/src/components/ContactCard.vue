<script setup>
import { ref } from 'vue'
import RQButton from '@/components/ui/RQButton.vue'
import RQCard from '@/components/ui/RQCard.vue'

defineProps({
  contact: {
    type: Object,
    required: true
  },
  onEdit: {
    type: Function,
    default: () => {}
  }
})
</script>

<template>
  <RQCard class="contact-card">
    <div class="contact-header">
      <h3>{{ contact.name }}</h3>
      <span class="relation">{{ contact.relation }}</span>
      <div class="actions">
        <RQButton @click="onEdit(contact)" variant="primary">编辑</RQButton>
        <RQButton variant="danger">删除</RQButton>
      </div>
    </div>
    
    <div class="contact-info">
      <p><strong>电话:</strong> {{ contact.phone || '未填写' }}</p>
      <p><strong>邮箱:</strong> {{ contact.email || '未填写' }}</p>
      <p><strong>地址:</strong> {{ contact.address || '未填写' }}</p>
      <p><strong>备注:</strong> {{ contact.note || '无' }}</p>
    </div>
    
    <div class="financial-summary">
      <p><strong>总支出:</strong> ¥{{ contact.totalSpent || 0 }}</p>
      <p><strong>总收入:</strong> ¥{{ contact.totalReceived || 0 }}</p>
      <p><strong>净收支:</strong> ¥{{ contact.netBalance || 0 }}</p>
    </div>
  </RQCard>
</template>

<style scoped>
.contact-card {
  border: 1px solid #ddd;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 8px;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.relation {
  color: #666;
  font-size: 0.9em;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>