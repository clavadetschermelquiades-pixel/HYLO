import { useState } from 'react'
import { getStoredReview, generateReview } from '../lib/weeklyReview.js'

export default function WeeklyReviewCard({ activities, morningChecks }) {
  const [review, setReview] = useState(() => getStoredReview())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const r = await generateReview(activities, morningChecks)
      setReview(r)
    } catch (e) {
      setError(e.message || 'Rückblick konnte nicht erstellt werden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h3>Wochenrückblick</h3>

      {review ? (
        <>
          <div className="list-item-detail" style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
            {review.summary}
          </div>
          <div className="list-item-date" style={{ marginBottom: 12 }}>
            Erstellt: {new Date(review.generatedAt).toLocaleString('de-DE')}
          </div>
        </>
      ) : (
        <div className="list-item-detail" style={{ marginBottom: 12 }}>
          Noch kein Rückblick für diese Woche. Wird automatisch sonntags ab 20 Uhr erstellt, oder jetzt manuell.
        </div>
      )}

      <button className="btn btn-secondary" onClick={handleGenerate} disabled={loading}>
        {loading ? 'Erstelle...' : review ? 'Neu generieren' : 'Jetzt generieren'}
      </button>

      {error && (
        <div className="list-item-detail" style={{ color: 'var(--danger)', marginTop: 10 }}>
          {error}
        </div>
      )}
    </div>
  )
}
