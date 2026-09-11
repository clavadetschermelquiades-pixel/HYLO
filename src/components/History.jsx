import { useMemo, useState } from 'react'
import { formatDate, formatDuration, formatPace } from '../lib/utils.js'

const FILTERS = [
  { id: 'all', label: 'Alle' },
  { id: 'run', label: 'Läufe' },
  { id: 'strength', label: 'Kraft' },
  { id: 'morning', label: 'Morgencheck' },
]

export default function History({ activities, morningChecks, onDeleteActivity, onDeleteMorningCheck }) {
  const [filter, setFilter] = useState('all')

  const entries = useMemo(() => {
    const fromActivities = activities.map((a) => ({ kind: a.type, data: a }))
    const fromChecks = morningChecks.map((c) => ({ kind: 'morning', data: c }))
    return [...fromActivities, ...fromChecks].sort(
      (a, b) => b.data.date.localeCompare(a.data.date) || b.data.createdAt - a.data.createdAt,
    )
  }, [activities, morningChecks])

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.kind === filter)

  return (
    <div>
      <div className="filter-row">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`filter-chip ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <div className="empty-state">Keine Einträge für diesen Filter.</div>}

      {filtered.map(({ kind, data }) => (
        <div className="list-item" key={`${kind}-${data.id}`}>
          <div className="list-item-top">
            <span className={`badge ${kind}`}>
              {kind === 'run' ? 'Lauf' : kind === 'strength' ? 'Kraft' : 'Morgencheck'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="list-item-date">{formatDate(data.date)}</span>
              <button
                className="icon-btn"
                aria-label="Eintrag löschen"
                onClick={() =>
                  kind === 'morning' ? onDeleteMorningCheck(data.id) : onDeleteActivity(data.id)
                }
              >
                🗑
              </button>
            </div>
          </div>

          {kind === 'run' && (
            <div className="list-item-detail">
              {data.distanceKm} km · {formatDuration(data.durationMin)} ·{' '}
              {formatPace(data.distanceKm, data.durationMin)}
            </div>
          )}

          {kind === 'strength' &&
            data.exercises?.map((ex, i) => (
              <div className="list-item-detail" key={i}>
                {ex.name}: {ex.sets.map((s) => `${s.reps}×${s.weight}kg`).join(', ')}
              </div>
            ))}

          {kind === 'morning' && (
            <div className="list-item-detail">
              {data.weightKg ? `${data.weightKg} kg` : '–'} · {data.restingHr ? `${data.restingHr} bpm` : '–'} ·{' '}
              {data.sleepHours ? `${data.sleepHours} h Schlaf` : '–'}
            </div>
          )}

          {data.notes && <div className="list-item-detail">„{data.notes}“</div>}
        </div>
      ))}
    </div>
  )
}
