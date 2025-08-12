<template>
  <div class="contact-view">
    <h1>Contact Management</h1>
    <ContactForm @contact-added="addContact" />
    <ContactCard v-for="contact in contacts" :key="contact.id" :contact="contact" @contact-deleted="deleteContact" />
  </div>
</template>

<script>
import ContactForm from '../components/contact/ContactForm.vue'
import ContactCard from '../components/contact/ContactCard.vue'
import { useContactStore } from '../stores'

export default {
  name: 'ContactView',
  components: {
    ContactForm,
    ContactCard
  },
  setup() {
    const contactStore = useContactStore()

    return {
      contacts: contactStore.contacts,
      addContact(contact) {
        contactStore.addContact(contact)
      },
      deleteContact(contactId) {
        contactStore.deleteContact(contactId)
      }
    }
  }
}
</script>

<style scoped>
/* styles */
</style>