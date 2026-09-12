import { addActivity, clearStravaAuth, getStravaAuth, hasStravaActivity, setStravaAuth } from './storage.js'

const CLIENT_ID = '278804'
const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun'])

function redirectUri() {
  return `${window.location.origin}/`
}

export function isStravaConnected() {
  return !!getStravaAuth()?.refresh_token
}

export function connectStrava() {
  const url = new URL('https://www.strava.com/oauth/authorize')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('approval_prompt', 'auto')
  url.searchParams.set('scope', 'activity:read_all')
  window.location.href = url.toString()
}

export function disconnectStrava() {
  clearStravaAuth()
}

/** Call once on app load. Returns true if an OAuth code was consumed. */
export async function handleStravaRedirect() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const scope = params.get('scope')
  const error = params.get('error')

  if (!code && !error) return false

  window.history.replaceState({}, '', window.location.pathname)

  if (error) {
    throw new Error('Strava-Verbindung abgelehnt oder fehlgeschlagen.')
  }

  if (!scope || !scope.includes('activity:read')) {
    throw new Error('Bitte Strava-Zugriff auf Aktivitäten erlauben.')
  }

  const res = await fetch('/.netlify/functions/strava-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  if (!res.ok) throw new Error('Strava-Anmeldung fehlgeschlagen.')

  const data = await res.json()
  setStravaAuth(data)
  return true
}

async function ensureFreshToken() {
  const auth = getStravaAuth()
  if (!auth) throw new Error('Nicht mit Strava verbunden.')

  const isExpired = auth.expires_at * 1000 < Date.now() + 60_000
  if (!isExpired) return auth

  const res = await fetch('/.netlify/functions/strava-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: auth.refresh_token }),
  })
  if (!res.ok) throw new Error('Strava-Token konnte nicht erneuert werden.')

  const data = await res.json()
  const updated = { ...auth, ...data }
  setStravaAuth(updated)
  return updated
}

/** Fetches new Strava activities and adds them to local storage. Returns count imported. */
export async function syncStravaActivities() {
  const auth = await ensureFreshToken()

  const res = await fetch('/.netlify/functions/strava-activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token: auth.access_token, after: auth.lastSyncAfter || 0 }),
  })
  if (!res.ok) throw new Error('Aktivitäten konnten nicht geladen werden.')

  const stravaActivities = await res.json()
  let imported = 0

  for (const a of stravaActivities) {
    if (hasStravaActivity(a.stravaId)) continue
    if (!RUN_TYPES.has(a.type)) continue

    addActivity({
      type: 'run',
      date: a.startDateLocal.slice(0, 10),
      distanceKm: Math.round((a.distanceMeters / 1000) * 100) / 100,
      durationMin: Math.round((a.movingTimeSeconds / 60) * 10) / 10,
      notes: `Importiert von Strava: ${a.name}`,
      stravaId: a.stravaId,
      source: 'strava',
    })
    imported++
  }

  setStravaAuth({ ...getStravaAuth(), lastSyncAt: Date.now(), lastSyncAfter: Math.floor(Date.now() / 1000) })
  return imported
}
