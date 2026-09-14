import TrendChart from './TrendChart.jsx'

export default function Stats({ morningChecks }) {
  const chronological = [...morningChecks].sort((a, b) => a.date.localeCompare(b.date))

  const restingHr = chronological.filter((c) => c.restingHr != null).map((c) => ({ date: c.date, value: c.restingHr }))
  const sleep = chronological.filter((c) => c.sleepHours != null).map((c) => ({ date: c.date, value: c.sleepHours }))
  const weight = chronological.filter((c) => c.weightKg != null).map((c) => ({ date: c.date, value: c.weightKg }))

  return (
    <div>
      <h3>Morgencheck-Verlauf</h3>
      <TrendChart title="Ruhepuls" color="#ef4444" unit=" bpm" points={restingHr} />
      <TrendChart title="Schlaf" color="#3b82f6" unit=" h" points={sleep} />
      <TrendChart title="Gewicht" color="#16a34a" unit=" kg" points={weight} />
    </div>
  )
}
