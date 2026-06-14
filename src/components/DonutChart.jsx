const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6']

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle > 180 ? 1 : 0
  return { path: `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`, end }
}

export default function DonutChart({ data }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])
  const total = entries.reduce((s, [, n]) => s + n, 0)
  if (total === 0) return null

  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 60

  let startAngle = 0
  const segments = entries.map(([label, count], i) => {
    const pct = count / total
    const endAngle = startAngle + pct * 360
    const arc = describeArc(cx, cy, r, startAngle, endAngle)
    const seg = {
      label,
      count,
      pct,
      path: arc.path,
      midAngle: (startAngle + endAngle) / 2,
      color: COLORS[i % COLORS.length],
    }
    startAngle = endAngle
    return seg
  })

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0" viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg) => (
          <path key={seg.label} d={seg.path} fill={seg.color} stroke="#fff" strokeWidth="2" />
        ))}
      </svg>

      <div className="flex-1 space-y-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-xs text-gray-500 flex-1">{seg.label}</span>
            <span className="text-xs text-gray-700 font-medium">{seg.count} 家</span>
          </div>
        ))}
      </div>
    </div>
  )
}
