<template>
  <div class="dashboard-view">
    <h1>Dashboard</h1>
    <!-- 添加概览信息 -->
    <div v-if="events.length > 0">
      <h2>Recent Events</h2>
      <ul>
        <li v-for="event in events" :key="event.id">{{ event.title }}</li>
      </ul>
    </div>
    <div v-if="contacts.length > 0">
      <h2>Contacts</h2>
      <ul>
        <li v-for="contact in contacts" :key="contact.id">{{ contact.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import { useEventStore, useContactStore } from '../stores'

export default {
  name: 'DashboardView',
  setup() {
    const eventStore = useEventStore()
    const contactStore = useContactStore()

    return {
      events: eventStore.events,
      contacts: contactStore.contacts
    }
  }
}
</script>

<style scoped>
/* styles */
</style>