import { useState } from 'react'
import { todayStr, formatPace } from '../lib/utils.js'

function emptyExercise() {
  return { name: '', sets: [{ reps: '', weight: '' }] }
}

export default function ActivityForm({ onSubmit }) {
  const [type, setType] = useState('run')
  const [date, setDate] = useState(todayStr())
  const [notes, setNotes] = useState('')

  const [distanceKm, setDistanceKm] = useState('')
  const [durationMin, setDurationMin] = useState('')

  const [exercises, setExercises] = useState([emptyExercise()])

  function updateExercise(idx, patch) {
    setExercises((prev) => prev.map((ex, i) => (i === idx ? { ...ex, ...patch } : ex)))
  }

  function updateSet(exIdx, setIdx, patch) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) }
          : ex,
      ),
    )
  }

  function addExercise() {
    setExercises((prev) => [...prev, emptyExercise()])
  }

  function removeExercise(idx) {
    setExercises((prev) => prev.filter((_, i) => i !== idx))
  }

  function addSet(exIdx) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: [...ex.sets, { reps: '', weight: '' }] } : ex)),
    )
  }

  function removeSet(exIdx, setIdx) {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex)),
    )
  }

  function resetForm() {
    setDate(todayStr())
    setNotes('')
    setDistanceKm('')
    setDurationMin('')
    setExercises([emptyExercise()])
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!date) return

    if (type === 'run') {
      if (!distanceKm || !durationMin) return
      onSubmit({
        type: 'run',
        date,
        distanceKm: parseFloat(distanceKm),
        durationMin: parseFloat(durationMin),
        notes: notes.trim(),
      })
    } else {
      const cleaned = exercises
        .filter((ex) => ex.name.trim())
        .map((ex) => ({
          name: ex.name.trim(),
          sets: ex.sets
            .filter((s) => s.reps !== '' || s.weight !== '')
            .map((s) => ({ reps: Number(s.reps) || 0, weight: Number(s.weight) || 0 })),
        }))
      if (cleaned.length === 0) return
      onSubmit({ type: 'strength', date, exercises: cleaned, notes: notes.trim() })
    }
    resetForm()
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div className="field">
        <label>Datum</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>

      {type === 'run' ? (
        <>
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
        </>
      ) : (
        <>
          {exercises.map((ex, exIdx) => (
            <div className="exercise-block" key={exIdx}>
              <div className="exercise-block-header">
                <input
                  placeholder={`Übung ${exIdx + 1} (z. B. Kniebeugen)`}
                  value={ex.name}
                  onChange={(e) => updateExercise(exIdx, { name: e.target.value })}
                  style={{ marginRight: 8 }}
                />
                {exercises.length > 1 && (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removeExercise(exIdx)}
                    aria-label="Übung entfernen"
                  >
                    ✕
                  </button>
                )}
              </div>

              {ex.sets.map((s, setIdx) => (
                <div className="set-row" key={setIdx}>
                  <span>{setIdx + 1}.</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    placeholder="Wdh."
                    value={s.reps}
                    onChange={(e) => updateSet(exIdx, setIdx, { reps: e.target.value })}
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    placeholder="kg"
                    value={s.weight}
                    onChange={(e) => updateSet(exIdx, setIdx, { weight: e.target.value })}
                  />
                  {ex.sets.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeSet(exIdx, setIdx)}
                      aria-label="Satz entfernen"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="btn btn-ghost" onClick={() => addSet(exIdx)}>
                + Satz
              </button>
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={addExercise} style={{ marginBottom: 16 }}>
            + Übung hinzufügen
          </button>
        </>
      )}

      <div className="field">
        <label>Notizen (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wie hat es sich angefühlt?" />
      </div>

      <button type="submit" className="btn btn-primary">
        Speichern
      </button>
    </form>
  )
}
