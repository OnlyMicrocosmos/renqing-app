<template>
  <div class="event-view">
    <h1>Event Management</h1>
    <EventForm @event-added="addEvent" />
    <EventList :events="events" @event-deleted="deleteEvent" />
  </div>
</template>

<script>
import EventForm from '../components/event/EventForm.vue'
import EventList from '../components/event/EventList.vue'
import { useEventStore } from '../stores'

export default {
  name: 'EventView',
  components: {
    EventForm,
    EventList
  },
  setup() {
    const eventStore = useEventStore()

    return {
      events: eventStore.events,
      addEvent(event) {
        eventStore.addEvent(event)
      },
      deleteEvent(eventId) {
        eventStore.deleteEvent(eventId)
      }
    }
  }
}
</script>

<style scoped>
/* styles */
</style>