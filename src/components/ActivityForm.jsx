import { useState } from 'react'
import { todayStr, formatPace } from '../lib/utils.js'
import StrengthSession from './StrengthSession.jsx'

export default function ActivityForm({ onSubmit }) {
  const [type, setType] = useState('run')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')
  const [distanceKm, setDistanceKm] = useState('')
  const [durationMin, setDurationMin] = useState('')

  function resetRunForm() {
    setDate(todayStr())
    setNotes('')
    setDistanceKm('')
    setDurationMin('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!date || !distanceKm || !durationMin) return
    onSubmit({
      type: 'run',
      date,
      distanceKm: parseFloat(distanceKm),
      durationMin: parseFloat(durationMin),
      notes: notes.trim(),
    })
    resetRunForm()
  }

  return (
    <div>
      <div className="type-toggle">
        <button
          type="button"
          className={type === 'run' ? 'active-run' : ''}
          onClick={() => setType('run')}
        >
          🏃 Lauf
        </button>
        <button
          type="button"
          className={type === 'strength' ? 'active-strength' : ''}
          onClick={() => setType('strength')}
        >
          🏋️ Kraft
        </button>
      </div>

      {type === 'run' ? (
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Datum</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="row">
            <div className="field">
              <label>Distanz (km)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="10.0"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Zeit (min)</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                placeholder="50"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label>Pace</label>
            <input value={formatPace(parseFloat(distanceKm), parseFloat(durationMin))} disabled />
          </div>

          <div className="field">
            <label>Notizen (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wie hat es sich angefühlt?" />
          </div>

          <button type="submit" className="btn btn-primary">
            Speichern
          </button>
        </form>
      ) : (
        <StrengthSession onSubmit={onSubmit} />
      )}
    </div>
  )
}
