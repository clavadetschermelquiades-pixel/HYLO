import { useState } from 'react'
import { connectStrava, disconnectStrava, isStravaConnected, syncStravaActivities } from '../lib/strava.js'
import { getStravaAuth } from '../lib/storage.js'

export default function StravaCard({ onSynced }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const connected = isStravaConnected()
  const auth = getStravaAuth()

  async function handleSync() {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const count = await syncStravaActivities()
      setMessage(count > 0 ? `${count} neue Aktivität(en) importiert.` : 'Keine neuen Aktivitäten gefunden.')
      onSynced?.()
    } catch (e) {
      setError(e.message || 'Sync fehlgeschlagen.')
    } finally {
      setBusy(false)
    }
  }

  function handleDisconnect() {
    disconnectStrava()
    setMessage('')
    setError('')
    onSynced?.()
  }

  return (
    <div className="card">
      <h3>Strava</h3>
      {!connected && (
        <>
          <div className="list-item-detail" style={{ marginBottom: 12 }}>
            Verbinde Strava, um Läufe automatisch zu importieren.
          </div>
          <button className="btn btn-accent" onClick={connectStrava}>
            Mit Strava verbinden
          </button>
        </>
      )}

      {connected && (
        <>
          <div className="list-item-detail" style={{ marginBottom: 12 }}>
            Verbunden{auth?.athlete ? ` als ${auth.athlete.firstname} ${auth.athlete.lastname}` : ''}
            {auth?.lastSyncAt && ` · zuletzt synchronisiert: ${new Date(auth.lastSyncAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`}
          </div>
          <div className="row" style={{ marginBottom: 8 }}>
            <button className="btn btn-primary" onClick={handleSync} disabled={busy}>
              {busy ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
            </button>
          </div>
          <button className="btn btn-ghost" onClick={handleDisconnect} disabled={busy}>
            Trennen
          </button>
        </>
      )}

      {message && <div className="list-item-detail" style={{ marginTop: 10, color: 'var(--strength)' }}>{message}</div>}
      {error && <div className="list-item-detail" style={{ marginTop: 10, color: 'var(--danger)' }}>{error}</div>}
    </div>
  )
}
