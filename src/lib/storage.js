const KEYS = {
  activities: 'hylo:activities',
  morningChecks: 'hylo:morningChecks',
}

function uid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function load(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function byDateDesc(a, b) {
  return b.date.localeCompare(a.date) || b.createdAt - a.createdAt
}

// --- Activities (run | strength) ---

export function getActivities() {
  return load(KEYS.activities).sort(byDateDesc)
}

export function addActivity(activity) {
  const all = load(KEYS.activities)
  const entry = { ...activity, id: uid(), createdAt: Date.now() }
  all.push(entry)
  save(KEYS.activities, all)
  return entry
}

export function deleteActivity(id) {
  const all = load(KEYS.activities).filter((a) => a.id !== id)
  save(KEYS.activities, all)
}

// --- Morning checks ---

export function getMorningChecks() {
  return load(KEYS.morningChecks).sort(byDateDesc)
}

export function addMorningCheck(check) {
  const all = load(KEYS.morningChecks)
  const entry = { ...check, id: uid(), createdAt: Date.now() }
  all.push(entry)
  save(KEYS.morningChecks, all)
  return entry
}

export function deleteMorningCheck(id) {
  const all = load(KEYS.morningChecks).filter((c) => c.id !== id)
  save(KEYS.morningChecks, all)
}
