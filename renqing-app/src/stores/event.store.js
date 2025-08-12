import { defineStore } from 'pinia'

export const useEventStore = defineStore('event', {
  state: () => ({
    events: []
  }),
  actions: {
    setEvents(events) {
      this.events = events
    },
    addEvent(event) {
      this.events.push(event)
    },
    updateEvent(updatedEvent) {
      const index = this.events.findIndex(event => event.id === updatedEvent.id)
      if (index !== -1) {
        this.events[index] = updatedEvent
      }
    },
    deleteEvent(eventId) {
      this.events = this.events.filter(event => event.id !== eventId)
    }
  }
})