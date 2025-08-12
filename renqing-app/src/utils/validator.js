export function validateForm(form) {
  let isValid = true
  if (!form.name) {
    console.error('Name is required')
    isValid = false
  }
  if (!form.date) {
    console.error('Date is required')
    isValid = false
  }
  return isValid
}