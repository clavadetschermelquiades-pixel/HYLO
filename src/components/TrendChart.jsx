import { useState } from 'react'
import { formatDate } from '../lib/utils.js'

const WIDTH = 320
const HEIGHT = 120
const PAD_X = 12
const PAD_TOP = 16
const PAD_BOTTOM = 24

export default function TrendChart({ title, color, unit, points }) {
  const [activeIndex, setActiveIndex] = useState(null)

  if (points.length === 0) {
    return (
      <div className="card">
        <h3>{title}</h3>
        <div className="empty-state">Noch keine Daten.</div>
      </div>
    )
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const yPad = range * 0.15

  const plotW = WIDTH - PAD_X * 2
  const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM

  function x(i) {
    return points.length === 1 ? PAD_X + plotW / 2 : PAD_X + (i / (points.length - 1)) * plotW
  }

  function y(v) {
    const domainMin = min - yPad
    const domainMax = max + yPad
    const t = (v - domainMin) / (domainMax - domainMin || 1)
    return PAD_TOP + plotH - t * plotH
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(p.value)}`).join(' ')
  const areaPath = `${linePath} L ${x(points.length - 1)} ${PAD_TOP + plotH} L ${x(0)} ${PAD_TOP + plotH} Z`

  const active = activeIndex !== null ? points[activeIndex] : null
  const last = points[points.length - 1]

  function handlePointer(e) {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clientX = e.clientX ?? e.touches?.[0]?.clientX
    if (clientX == null) return
    const relX = ((clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    let nearestDist = Infinity
    points.forEach((_, i) => {
      const dist = Math.abs(x(i) - relX)
      if (dist < nearestDist) {
        nearestDist = dist
        nearest = i
      }
    })
    setActiveIndex(nearest)
  }

  return (
    <div className="card">
      <div className="exercise-block-header" style={{ marginBottom: 2 }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span style={{ color, fontWeight: 700, fontSize: 18 }}>
          {last.value}
          {unit}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: '100%', height: 'auto', touchAction: 'none' }}
        onPointerDown={handlePointer}
        onPointerMove={handlePointer}
      >
        <path d={areaPath} fill={color} opacity={0.15} stroke="none" />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(p.value)}
            r={i === activeIndex ? 5 : i === points.length - 1 ? 4 : 0}
            fill={color}
            stroke="var(--surface)"
            strokeWidth={i === activeIndex ? 2 : 0}
          />
        ))}

        {active && (
          <line x1={x(activeIndex)} x2={x(activeIndex)} y1={PAD_TOP} y2={PAD_TOP + plotH} stroke={color} strokeWidth={1} opacity={0.4} />
        )}

        <text x={PAD_X} y={HEIGHT - 6} fontSize="9" fill="var(--text-dim)">
          {formatDate(points[0].date)}
        </text>
        <text x={WIDTH - PAD_X} y={HEIGHT - 6} fontSize="9" fill="var(--text-dim)" textAnchor="end">
          {formatDate(points[points.length - 1].date)}
        </text>
      </svg>

      {active && (
        <div className="list-item-detail" style={{ textAlign: 'center' }}>
          {formatDate(active.date)}: <strong style={{ color }}>{active.value}{unit}</strong>
        </div>
      )}
    </div>
  )
}
