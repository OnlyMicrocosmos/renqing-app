<template>
  <div class="settings-view">
    <div class="page-header">
      <h1>设置</h1>
      <p>管理应用设置和偏好</p>
    </div>

    <div class="settings-section card">
      <div class="section-header">
        <h3>通用设置</h3>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">默认货币</div>
          <div class="setting-description">设置显示金额的默认货币单位</div>
        </div>
        <select v-model="settings.currency" class="setting-select">
          <option value="CNY">人民币 (¥)</option>
          <option value="USD">美元 ($)</option>
          <option value="EUR">欧元 (€)</option>
        </select>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">日期格式</div>
          <div class="setting-description">设置日期显示格式</div>
        </div>
        <select v-model="settings.dateFormat" class="setting-select">
          <option value="yyyy-MM-dd">2023-12-25</option>
          <option value="yyyy/MM/dd">2023/12/25</option>
          <option value="MM/dd/yyyy">12/25/2023</option>
          <option value="dd/MM/yyyy">25/12/2023</option>
        </select>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">主题</div>
          <div class="setting-description">选择应用主题</div>
        </div>
        <select v-model="settings.theme" class="setting-select">
          <option value="light">浅色</option>
          <option value="dark">深色</option>
          <option value="auto">自动</option>
        </select>
      </div>
    </div>

    <div class="settings-section card">
      <div class="section-header">
        <h3>通知设置</h3>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">事件提醒</div>
          <div class="setting-description">在重要人情事件前发送提醒</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.eventReminders">
          <span class="slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">年度总结</div>
          <div class="setting-description">每年年底发送人情往来总结</div>
        </div>
        <label class="switch">
          <input type="checkbox" v-model="settings.yearlySummary">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section card">
      <div class="section-header">
        <h3>数据管理</h3>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">导出数据</div>
          <div class="setting-description">将所有数据导出为CSV文件</div>
        </div>
        <button class="btn btn-outline" @click="exportData">导出</button>
      </div>
      
      <div class="setting-item">
        <div class="setting-info">
          <div class="setting-label">导入数据</div>
          <div class="setting-description">从CSV文件导入数据</div>
        </div>
        <button class="btn btn-outline" @click="importData">导入</button>
      </div>
      
      <div class="setting-item danger-zone">
        <div class="setting-info">
          <div class="setting-label">清空所有数据</div>
          <div class="setting-description">删除所有记录和联系人（谨慎操作）</div>
        </div>
        <button class="btn btn-danger" @click="clearAllData">清空数据</button>
      </div>
    </div>

    <div class="settings-actions">
      <button class="btn btn-primary" @click="saveSettings">保存设置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const settings = ref({
  currency: 'CNY',
  dateFormat: 'yyyy-MM-dd',
  theme: 'light',
  eventReminders: true,
  yearlySummary: true
})

onMounted(() => {
  // 从本地存储加载设置
  const savedSettings = localStorage.getItem('app-settings')
  if (savedSettings) {
    try {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) }
    } catch (e) {
      console.error('Failed to parse settings', e)
    }
  }
})

const saveSettings = () => {
  localStorage.setItem('app-settings', JSON.stringify(settings.value))
  alert('设置已保存')
}

const exportData = () => {
  alert('导出功能将在后续版本中实现')
}

const importData = () => {
  alert('导入功能将在后续版本中实现')
}

const clearAllData = () => {
  if (confirm('确定要清空所有数据吗？此操作不可撤销！')) {
    localStorage.clear()
    alert('所有数据已清空')
    // 可以考虑刷新页面或重置应用状态
  }
}
</script>

<style scoped>
.settings-view {
  padding-bottom: 2rem;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray);
  margin: 0;
}

.settings-section {
  margin-bottom: 1.5rem;
}

.section-header {
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--dark);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.danger-zone {
  background-color: rgba(220, 53, 69, 0.05);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.setting-description {
  font-size: 0.875rem;
  color: var(--gray);
}

.setting-select {
  padding: 0.5rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
  font-size: 1rem;
  outline: none;
  transition: var(--transition);
}

.setting-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--light-gray);
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.settings-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 0;
}

.btn-danger {
  background-color: var(--danger);
  border-color: var(--danger);
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .settings-actions {
    justify-content: center;
  }
}
</style>