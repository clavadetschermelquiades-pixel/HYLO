import { useEffect, useState } from 'react'
import {
  getActiveSession,
  setActiveSession,
  clearActiveSession,
  getRoutines,
  addRoutine,
  updateRoutine,
  deleteRoutine,
} from '../lib/storage.js'
import { getExercises, addExercise, CATEGORIES } from '../lib/exercises.js'
import { dateFromTimestamp, formatElapsed } from '../lib/utils.js'

function emptySet() {
  return { reps: '', weight: '' }
}

function ExercisePicker({ onAdd }) {
  const [library, setLibrary] = useState(() => getExercises())
  const [categoryFilter, setCategoryFilter] = useState('kraft')
  const [customName, setCustomName] = useState('')

  const filtered = library.filter((e) => e.category === categoryFilter)

  function handlePick(name, category) {
    addExercise(name, category)
    setLibrary(getExercises())
    onAdd(name, category)
  }

  function handleAddCustom() {
    if (!customName.trim()) return
    handlePick(customName.trim(), categoryFilter)
    setCustomName('')
  }

  return (
    <div>
      <div className="filter-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`filter-chip ${categoryFilter === c.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="filter-row">
        {filtered.map((e) => (
          <button key={e.id} className="filter-chip" onClick={() => handlePick(e.name, e.category)}>
            + {e.name}
          </button>
        ))}
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        <input
          placeholder="Eigene Übung..."
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-secondary" style={{ width: 'auto', flex: '0 0 auto' }} onClick={handleAddCustom}>
          Hinzufügen
        </button>
      </div>
    </div>
  )
}

function PreSessionScreen({ onStart }) {
  const [routines, setRoutines] = useState(() => getRoutines())
  const [draft, setDraft] = useState([]) // [{name, category}]
  const [routineName, setRoutineName] = useState('')

  function addToDraft(name, category) {
    setDraft((prev) => [...prev, { name, category }])
  }

  function removeFromDraft(idx) {
    setDraft((prev) => prev.filter((_, i) => i !== idx))
  }

  function saveRoutine() {
    if (!routineName.trim() || draft.length === 0) return
    addRoutine({ name: routineName.trim(), exercises: draft })
    setRoutines(getRoutines())
    setRoutineName('')
  }

  function handleDeleteRoutine(id) {
    if (!window.confirm('Diese Trainings-Sammlung wirklich löschen?')) return
    deleteRoutine(id)
    setRoutines(getRoutines())
  }

  return (
    <div>
      {routines.length > 0 && (
        <>
          <h3>Meine Trainings</h3>
          {routines.map((r) => (
            <div className="card" key={r.id}>
              <div className="exercise-block-header" style={{ marginBottom: 4 }}>
                <strong>{r.name}</strong>
                <button className="icon-btn" onClick={() => handleDeleteRoutine(r.id)} aria-label="Sammlung löschen">
                  ✕
                </button>
              </div>
              <div className="list-item-detail" style={{ marginBottom: 12 }}>
                {r.exercises.map((e) => e.name).join(', ')}
              </div>
              <button className="btn btn-accent" onClick={() => onStart(r.exercises, r.id)}>
                Starten
              </button>
            </div>
          ))}
        </>
      )}

      <h3>Neues Training zusammenstellen</h3>
      <ExercisePicker onAdd={addToDraft} />

      {draft.length > 0 && (
        <div className="card">
          {draft.map((ex, i) => (
            <div className="list-item-top" key={i} style={{ marginBottom: 8 }}>
              <span>{ex.name}</span>
              <button className="icon-btn" onClick={() => removeFromDraft(i)} aria-label="Entfernen">
                ✕
              </button>
            </div>
          ))}

          <div className="row" style={{ marginBottom: 12 }}>
            <input
              placeholder="Name für diese Sammlung..."
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
          <button className="btn btn-secondary" onClick={saveRoutine} style={{ marginBottom: 10 }}>
            Als Sammlung speichern
          </button>
        </div>
      )}

      <button className="btn btn-accent" onClick={() => onStart(draft)}>
        Training starten
      </button>
    </div>
  )
}

export default function StrengthSession({ onSubmit }) {
  const [session, setSession] = useState(() => getActiveSession())
  const [elapsedSec, setElapsedSec] = useState(0)
  const [notes, setNotes] = useState('')
  const [routineUpdateMessage, setRoutineUpdateMessage] = useState('')

  useEffect(() => {
    if (!session) return
    const tick = () => setElapsedSec(Math.floor((Date.now() - session.startedAt) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [session?.startedAt])

  function persist(updated) {
    setActiveSession(updated)
    setSession(updated)
  }

  function startSession(initialExercises = [], routineId = null) {
    const s = {
      startedAt: Date.now(),
      routineId,
      exercises: initialExercises.map((ex) => ({ name: ex.name, category: ex.category, sets: [emptySet()] })),
    }
    persist(s)
  }

  function cancelSession() {
    if (!window.confirm('Training wirklich verwerfen? Alle erfassten Sätze gehen verloren.')) return
    clearActiveSession()
    setSession(null)
    setElapsedSec(0)
    setNotes('')
  }

  function addExerciseToSession(name, category) {
    const updated = {
      ...session,
      exercises: [...session.exercises, { name, category, sets: [emptySet()] }],
    }
    persist(updated)
  }

  function updateSet(exIdx, setIdx, patch) {
    const exercises = session.exercises.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) } : ex,
    )
    persist({ ...session, exercises })
  }

  function addSet(exIdx) {
    const exercises = session.exercises.map((ex, i) =>
      i === exIdx ? { ...ex, sets: [...ex.sets, emptySet()] } : ex,
    )
    persist({ ...session, exercises })
  }

  function removeSet(exIdx, setIdx) {
    const exercises = session.exercises.map((ex, i) =>
      i === exIdx ? { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) } : ex,
    )
    persist({ ...session, exercises })
  }

  function removeExercise(exIdx) {
    persist({ ...session, exercises: session.exercises.filter((_, i) => i !== exIdx) })
  }

  function updateRoutineFromSession() {
    updateRoutine(session.routineId, {
      exercises: session.exercises.map((ex) => ({ name: ex.name, category: ex.category })),
    })
    setRoutineUpdateMessage('Sammlung aktualisiert.')
    setTimeout(() => setRoutineUpdateMessage(''), 3000)
  }

  function finishSession() {
    const durationMin = Math.round(((Date.now() - session.startedAt) / 60000) * 10) / 10
    const cleaned = session.exercises
      .map((ex) => ({
        ...ex,
        sets: ex.sets.filter((s) => s.reps !== '' || s.weight !== '').map((s) => ({
          reps: Number(s.reps) || 0,
          weight: Number(s.weight) || 0,
        })),
      }))
      .filter((ex) => ex.sets.length > 0)

    onSubmit({
      type: 'strength',
      date: dateFromTimestamp(session.startedAt),
      durationMin,
      exercises: cleaned,
      notes: notes.trim(),
    })

    clearActiveSession()
    setSession(null)
    setElapsedSec(0)
    setNotes('')
  }

  if (!session) {
    return <PreSessionScreen onStart={startSession} />
  }

  return (
    <div>
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="label" style={{ marginBottom: 4 }}>
          Laufende Zeit
        </div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>{formatElapsed(elapsedSec)}</div>
      </div>

      <h3>Übung hinzufügen</h3>
      <ExercisePicker onAdd={addExerciseToSession} />

      {session.exercises.map((ex, exIdx) => (
        <div className="exercise-block" key={exIdx}>
          <div className="exercise-block-header">
            <strong>{ex.name}</strong>
            <button
              type="button"
              className="icon-btn"
              onClick={() => removeExercise(exIdx)}
              aria-label="Übung entfernen"
            >
              ✕
            </button>
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

      {session.routineId && (
        <>
          <button className="btn btn-secondary" onClick={updateRoutineFromSession} style={{ marginBottom: 10 }}>
            Sammlung aktualisieren
          </button>
          {routineUpdateMessage && (
            <div className="list-item-detail" style={{ color: 'var(--strength)', marginBottom: 10 }}>
              {routineUpdateMessage}
            </div>
          )}
        </>
      )}

      <div className="field">
        <label>Notizen (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Wie hat es sich angefühlt?" />
      </div>

      <button className="btn btn-primary" onClick={finishSession} style={{ marginBottom: 10 }}>
        Training beenden
      </button>
      <button className="btn btn-danger" onClick={cancelSession}>
        Verwerfen
      </button>
    </div>
  )
}
