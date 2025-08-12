import { defineStore } from 'pinia'

export const useContactStore = defineStore('contact', {
  state: () => ({
    contacts: []
  }),
  actions: {
    setContacts(contacts) {
      this.contacts = contacts
    },
    addContact(contact) {
      this.contacts.push(contact)
    },
    updateContact(updatedContact) {
      const index = this.contacts.findIndex(contact => contact.id === updatedContact.id)
      if (index !== -1) {
        this.contacts[index] = updatedContact
      }
    },
    deleteContact(contactId) {
      this.contacts = this.contacts.filter(contact => contact.id !== contactId)
    }
  }
})