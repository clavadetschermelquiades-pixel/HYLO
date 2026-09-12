import { getActivities } from './storage.js'

const KEY = 'hylo:exercises'

export const CATEGORIES = [
  { id: 'kraft', label: 'Kraft' },
  { id: 'mobility', label: 'Mobility' },
  { id: 'physio', label: 'Physio' },
]

const DEFAULT_EXERCISES = [
  { name: 'Kniebeugen', category: 'kraft' },
  { name: 'Kreuzheben', category: 'kraft' },
  { name: 'Bankdrücken', category: 'kraft' },
  { name: 'Schulterdrücken', category: 'kraft' },
  { name: 'Klimmzüge', category: 'kraft' },
  { name: 'Rudern', category: 'kraft' },
  { name: 'Ausfallschritte', category: 'kraft' },
  { name: 'Beinpresse', category: 'kraft' },
  { name: 'Bizeps-Curls', category: 'kraft' },
  { name: 'Trizepsdrücken', category: 'kraft' },
  { name: 'Hüftöffner', category: 'mobility' },
  { name: 'Schulterkreisen', category: 'mobility' },
  { name: 'Katze-Kuh', category: 'mobility' },
  { name: 'Thorakale Rotation', category: 'mobility' },
  { name: 'Beinschwingen', category: 'mobility' },
  { name: 'Knöchelmobilisation', category: 'mobility' },
  { name: 'Plank', category: 'physio' },
  { name: 'Glute Bridge', category: 'physio' },
  { name: 'Band-Außenrotation', category: 'physio' },
  { name: 'Nordic Hamstring Curl', category: 'physio' },
  { name: 'Wandsitzen', category: 'physio' },
]

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function load() {
  const raw = localStorage.getItem(KEY)
  if (raw) {
    try {
      return JSON.parse(raw)
    } catch {
      // fall through to reseed
    }
  }
  const seeded = DEFAULT_EXERCISES.map((e) => ({ ...e, id: uid() }))
  localStorage.setItem(KEY, JSON.stringify(seeded))
  return seeded
}

export function getExercises() {
  return load()
}

export function addExercise(name, category) {
  const all = load()
  const trimmed = name.trim()
  const existing = all.find((e) => e.name.toLowerCase() === trimmed.toLowerCase() && e.category === category)
  if (existing) return existing

  const entry = { id: uid(), name: trimmed, category }
  all.push(entry)
  localStorage.setItem(KEY, JSON.stringify(all))
  return entry
}

export function deleteExercise(id) {
  const all = load().filter((e) => e.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

/** Sets from the most recent logged session that included this exercise, or null. */
export function getLastPerformance(name) {
  const activities = getActivities()
  for (const a of activities) {
    if (a.type !== 'strength') continue
    const match = a.exercises?.find((ex) => ex.name.toLowerCase() === name.toLowerCase())
    if (match && match.sets?.length > 0) return match.sets
  }
  return null
}
