export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
}

/** Pace in min/km as "m:ss" */
export function formatPace(distanceKm, durationMin) {
  if (!distanceKm || !durationMin) return '–'
  const paceMin = durationMin / distanceKm
  const min = Math.floor(paceMin)
  const sec = Math.round((paceMin - min) * 60)
  return `${min}:${String(sec).padStart(2, '0')} min/km`
}

export function formatDuration(durationMin) {
  const h = Math.floor(durationMin / 60)
  const m = Math.round(durationMin % 60)
  return h > 0 ? `${h} h ${m} min` : `${m} min`
}

export function startOfWeek(date = new Date()) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function isThisWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const start = startOfWeek()
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return d >= start && d < end
}
