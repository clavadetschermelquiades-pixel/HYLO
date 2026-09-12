const KEYS = {
  activities: 'hylo:activities',
  morningChecks: 'hylo:morningChecks',
  stravaAuth: 'hylo:stravaAuth',
  activeSession: 'hylo:activeSession',
  routines: 'hylo:routines',
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

export function hasStravaActivity(stravaId) {
  return load(KEYS.activities).some((a) => a.stravaId === stravaId)
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

// --- Strava connection ---

export function getStravaAuth() {
  try {
    const raw = localStorage.getItem(KEYS.stravaAuth)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setStravaAuth(auth) {
  localStorage.setItem(KEYS.stravaAuth, JSON.stringify(auth))
}

export function clearStravaAuth() {
  localStorage.removeItem(KEYS.stravaAuth)
}

// --- Active strength/mobility/physio session (survives reloads) ---

export function getActiveSession() {
  try {
    const raw = localStorage.getItem(KEYS.activeSession)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setActiveSession(session) {
  localStorage.setItem(KEYS.activeSession, JSON.stringify(session))
}

export function clearActiveSession() {
  localStorage.removeItem(KEYS.activeSession)
}

// --- Saved training routines (reusable exercise collections) ---

export function getRoutines() {
  return load(KEYS.routines)
}

export function addRoutine(routine) {
  const all = load(KEYS.routines)
  const entry = { ...routine, id: uid(), createdAt: Date.now() }
  all.push(entry)
  save(KEYS.routines, all)
  return entry
}

export function deleteRoutine(id) {
  const all = load(KEYS.routines).filter((r) => r.id !== id)
  save(KEYS.routines, all)
}

export function updateRoutine(id, patch) {
  const all = load(KEYS.routines).map((r) => (r.id === id ? { ...r, ...patch } : r))
  save(KEYS.routines, all)
}
