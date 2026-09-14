import { useState } from 'react'
import { getStravaAuth } from '../lib/storage.js'

export default function StravaDebug() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleFetch() {
    setLoading(true)
    setResult('')
    try {
      const auth = getStravaAuth()
      if (!auth) {
        setResult('Nicht mit Strava verbunden.')
        return
      }
      const res = await fetch('/.netlify/functions/strava-debug-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: auth.access_token }),
      })
      const data = await res.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (e) {
      setResult('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ borderColor: 'var(--run)' }}>
      <h3>Debug (temporär): Strava-Rohdaten</h3>
      <button className="btn btn-secondary" onClick={handleFetch} disabled={loading}>
        {loading ? 'Lade...' : 'Strava-Kraft-Aktivität laden'}
      </button>
      {result && (
        <textarea
          readOnly
          value={result}
          style={{ marginTop: 12, minHeight: 300, fontFamily: 'monospace', fontSize: 11 }}
        />
      )}
    </div>
  )
}
