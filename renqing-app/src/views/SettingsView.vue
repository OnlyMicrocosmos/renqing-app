<template>
  <div class="settings-view">
    <h1>Settings View</h1>
    <RQInput v-model="settingValue" placeholder="Enter setting value" />
    <RQButton @click="saveSettings">Save Settings</RQButton>
  </div>
</template>

<script>
import RQInput from '../components/ui/RQInput.vue'
import RQButton from '../components/ui/RQButton.vue'

export default {
  name: 'SettingsView',
  components: {
    RQInput,
    RQButton
  },
  data() {
    return {
      settingValue: ''
    }
  },
  methods: {
    saveSettings() {
      // Save settings logic
      console.log('Saving settings:', this.settingValue)
    }
  }
}
</script>

<style scoped>
/* styles */
</style>