function toLocalDateKey(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getStartOfWeekMonday(dateValue) {
  const start = new Date(dateValue)
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  const offset = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + offset)
  return start
}


export { toLocalDateKey, getStartOfWeekMonday }
