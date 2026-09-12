import { startOfWeek, dateFromTimestamp } from './utils.js'

const KEY = 'hylo:weeklyReview'
const REVIEW_HOUR = 18 // Sonntag ab 18:00 Uhr

function currentWeekKey() {
  return dateFromTimestamp(startOfWeek().getTime())
}

function last7DaysCutoff() {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  return dateFromTimestamp(d.getTime())
}

export function getStoredReview() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredReview(review) {
  localStorage.setItem(KEY, JSON.stringify(review))
}

/** True once it's Sunday past the configured hour and no review exists yet for this week. */
export function shouldAutoGenerate() {
  const now = new Date()
  const isSunday = now.getDay() === 0
  const pastHour = now.getHours() >= REVIEW_HOUR
  if (!isSunday || !pastHour) return false

  const stored = getStoredReview()
  return !stored || stored.weekKey !== currentWeekKey()
}

export async function generateReview(activities, morningChecks) {
  const cutoff = last7DaysCutoff()
  const recentActivities = activities.filter((a) => a.date >= cutoff)
  const recentChecks = morningChecks.filter((c) => c.date >= cutoff)

  const res = await fetch('/.netlify/functions/weekly-review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activities: recentActivities, morningChecks: recentChecks }),
  })
  if (!res.ok) throw new Error('Wochenrückblick konnte nicht erstellt werden.')

  const data = await res.json()
  const review = { weekKey: currentWeekKey(), generatedAt: Date.now(), summary: data.summary }
  setStoredReview(review)
  return review
}
