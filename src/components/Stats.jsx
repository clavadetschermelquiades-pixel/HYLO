import TrendChart from './TrendChart.jsx'
import StravaDebug from './StravaDebug.jsx'
import { formatPaceValue } from '../lib/utils.js'

export default function Stats({ activities, morningChecks }) {
  const chronologicalChecks = [...morningChecks].sort((a, b) => a.date.localeCompare(b.date))

  const restingHr = chronologicalChecks.filter((c) => c.restingHr != null).map((c) => ({ date: c.date, value: c.restingHr }))
  const sleep = chronologicalChecks.filter((c) => c.sleepHours != null).map((c) => ({ date: c.date, value: c.sleepHours }))
  const weight = chronologicalChecks.filter((c) => c.weightKg != null).map((c) => ({ date: c.date, value: c.weightKg }))

  const runs = activities.filter((a) => a.type === 'run').sort((a, b) => a.date.localeCompare(b.date))
  const distance = runs.map((r) => ({ date: r.date, value: r.distanceKm }))
  const duration = runs.map((r) => ({ date: r.date, value: r.durationMin }))
  const pace = runs
    .filter((r) => r.distanceKm > 0)
    .map((r) => ({ date: r.date, value: r.durationMin / r.distanceKm }))

  return (
    <div>
      <StravaDebug />

      <h3>Lauf-Verlauf</h3>
      <TrendChart title="Distanz" color="#f59e0b" unit=" km" points={distance} />
      <TrendChart title="Dauer" color="#f59e0b" unit=" min" points={duration} />
      <TrendChart title="Pace" color="#f59e0b" points={pace} formatValue={formatPaceValue} />

      <h3>Morgencheck-Verlauf</h3>
      <TrendChart title="Ruhepuls" color="#ef4444" unit=" bpm" points={restingHr} />
      <TrendChart title="Schlaf" color="#3b82f6" unit=" h" points={sleep} />
      <TrendChart title="Gewicht" color="#16a34a" unit=" kg" points={weight} />
    </div>
  )
}
