export function checkReminders(events) {
  const today = new Date()
  return events.filter(event => {
    const eventDate = new Date(event.date)
    return eventDate >= today && eventDate <= new Date(today.setDate(today.getDate() + 7))
  })
}