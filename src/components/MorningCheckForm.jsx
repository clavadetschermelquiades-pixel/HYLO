import { useState } from 'react'
import { todayStr } from '../lib/utils.js'

export default function MorningCheckForm({ onSubmit }) {
  const [date, setDate] = useState(todayStr())
  const [weightKg, setWeightKg] = useState('')
  const [restingHr, setRestingHr] = useState('')
  const [sleepHours, setSleepHours] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!date) return
    onSubmit({
      date,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      restingHr: restingHr ? parseInt(restingHr, 10) : null,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      notes: notes.trim(),
    })
    setWeightKg('')
    setRestingHr('')
    setSleepHours('')
    setNotes('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Datum</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      <div className="row">
        <div className="field">
          <label>Gewicht (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            placeholder="72.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Ruhepuls (bpm)</label>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            placeholder="52"
            value={restingHr}
            onChange={(e) => setRestingHr(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Schlaf (Stunden)</label>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="24"
          placeholder="7.5"
          value={sleepHours}
          onChange={(e) => setSleepHours(e.target.value)}
        />
      </div>

      <div className="field">
        <label>Notizen (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Befinden, Auffälligkeiten..." />
      </div>

      <button type="submit" className="btn btn-primary">
        Speichern
      </button>
    </form>
  )
}
