import { formatDate, formatDuration, formatPace, isThisWeek } from '../lib/utils.js'
import StravaCard from './StravaCard.jsx'

export default function Dashboard({ activities, morningChecks, onNavigate, onDataChanged, stravaError }) {
  const weekRuns = activities.filter((a) => a.type === 'run' && isThisWeek(a.date))
  const weekStrength = activities.filter((a) => a.type === 'strength' && isThisWeek(a.date))
  const weekDistance = weekRuns.reduce((sum, a) => sum + (a.distanceKm || 0), 0)
  const latestCheck = morningChecks[0]
  const recent = activities.slice(0, 5)

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-tile">
          <div className="label">Laufdistanz (Woche)</div>
          <div className="value">{weekDistance.toFixed(1)} km</div>
        </div>
        <div className="stat-tile">
          <div className="label">Läufe (Woche)</div>
          <div className="value">{weekRuns.length}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Kraft-Sessions (Woche)</div>
          <div className="value">{weekStrength.length}</div>
        </div>
        <div className="stat-tile">
          <div className="label">Ruhepuls (letzter)</div>
          <div className="value">{latestCheck ? `${latestCheck.restingHr} bpm` : '–'}</div>
        </div>
      </div>

      <div className="row" style={{ marginBottom: 20 }}>
        <button className="btn btn-accent" onClick={() => onNavigate('log')}>
          + Aktivität loggen
        </button>
        <button className="btn btn-secondary" onClick={() => onNavigate('morning')}>
          ☀️ Morgencheck
        </button>
      </div>

      {stravaError && (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          {stravaError}
        </div>
      )}

      <StravaCard onSynced={onDataChanged} />

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
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
