import { useState } from 'react'
import { formatDate, formatDuration, formatPace, isThisWeek } from '../lib/utils.js'
import WeeklyReviewCard from './WeeklyReviewCard.jsx'

export default function Dashboard({ activities, morningChecks, onNavigate }) {
  const [expanded, setExpanded] = useState(null) // 'run' | 'strength' | null

  const weekRuns = activities.filter((a) => a.type === 'run' && isThisWeek(a.date))
  const weekStrength = activities.filter((a) => a.type === 'strength' && isThisWeek(a.date))
  const weekDistance = weekRuns.reduce((sum, a) => sum + (a.distanceKm || 0), 0)
  const latestCheck = morningChecks[0]
  const recent = activities.slice(0, 5)

  function toggle(kind) {
    setExpanded((current) => (current === kind ? null : kind))
  }

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Laufdistanz (Woche)</div>
          <div className="value">{weekDistance.toFixed(1)} km</div>
        </div>
        <div className="stat-tile clickable" onClick={() => toggle('run')}>
          <div className="label">Läufe (Woche)</div>
          <div className="value">{weekRuns.length}</div>
        </div>
        <div className="stat-tile clickable" onClick={() => toggle('strength')}>
          <div className="label">Kraft-Sessions (Woche)</div>
          <div className="value">{weekStrength.length}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Ruhepuls (letzter)</div>
          <div className="value">{latestCheck ? `${latestCheck.restingHr} bpm` : '–'}</div>
        </div>
      </div>

      {expanded === 'run' && (
        <div className="card">
          <h3>Läufe diese Woche</h3>
          {weekRuns.length === 0 && <div className="empty-state">Keine Läufe diese Woche.</div>}
          {weekRuns.map((a) => (
            <div className="list-item" key={a.id}>
              <div className="list-item-top">
                <span className="badge run">Lauf</span>
                <span className="list-item-date">{formatDate(a.date)}</span>
              </div>
              <div className="list-item-detail">
                {a.distanceKm} km · {formatDuration(a.durationMin)} · {formatPace(a.distanceKm, a.durationMin)}
              </div>
            </div>
          ))}
        </div>
      )}

      {expanded === 'strength' && (
        <div className="card">
          <h3>Krafttraining diese Woche</h3>
          {weekStrength.length === 0 && <div className="empty-state">Kein Krafttraining diese Woche.</div>}
          {weekStrength.map((a) => (
            <div className="list-item" key={a.id}>
              <div className="list-item-top">
                <span className="badge strength">Kraft</span>
                <span className="list-item-date">{formatDate(a.date)}</span>
              </div>
              {a.durationMin ? <div className="list-item-detail">Dauer: {formatDuration(a.durationMin)}</div> : null}
              {a.exercises?.map((ex, i) => (
                <div className="list-item-detail" key={i}>
                  {ex.name}: {ex.sets.map((s) => `${s.reps}×${s.weight}kg`).join(', ')}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="row" style={{ marginBottom: 20 }}>
        <button className="btn btn-accent" onClick={() => onNavigate('log')}>
          + Aktivität loggen
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('morning')}>
          Morgencheck
        </button>
      </div>

      <WeeklyReviewCard activities={activities} morningChecks={morningChecks} />

      {latestCheck && (
        <div className="card">
          <h3>Letzter Morgencheck – {formatDate(latestCheck.date)}</h3>
          <div className="list-item-detail">
            Gewicht: {latestCheck.weightKg ? `${latestCheck.weightKg} kg` : '–'} · Ruhepuls:{' '}
            {latestCheck.restingHr ? `${latestCheck.restingHr} bpm` : '–'} · Schlaf:{' '}
            {latestCheck.sleepHours ? `${latestCheck.sleepHours} h` : '–'}
          </div>
          {latestCheck.notes && <div className="list-item-detail">„{latestCheck.notes}“</div>}
        </div>
      )}

      <h3>Letzte Aktivitäten</h3>
      {recent.length === 0 && <div className="empty-state">Noch keine Aktivitäten geloggt.</div>}
      {recent.map((a) => (
        <div className="list-item" key={a.id}>
          <div className="list-item-top">
            <span className={`badge ${a.type}`}>{a.type === 'run' ? 'Lauf' : 'Kraft'}</span>
            <span className="list-item-date">{formatDate(a.date)}</span>
          </div>
          {a.type === 'run' ? (
            <div className="list-item-detail">
              {a.distanceKm} km · {formatDuration(a.durationMin)} · {formatPace(a.distanceKm, a.durationMin)}
            </div>
          ) : (
            <div className="list-item-detail">
              {a.exercises?.length || 0} Übung(en) ·{' '}
              {a.exercises?.reduce((s, ex) => s + (ex.sets?.length || 0), 0) || 0} Sätze
              {a.durationMin ? ` · ${formatDuration(a.durationMin)}` : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
