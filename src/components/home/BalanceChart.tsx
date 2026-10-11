import { HdsToggleSegment } from '../ui/hds'
import { useMemo, useState } from 'react'

const WIDTH = 946
const HEIGHT = 205

// Illustrative balance series for the active 1M range — shape approximates the design reference.
const VALUES = [
  118200, 119400, 118900, 121600, 124800, 126200, 125100, 127400, 129800, 128600,
  130200, 129100, 131500, 133200, 132400, 131800, 133600, 136200, 138100, 136900,
  135200, 137800, 140600, 142900, 141200, 139800, 141600, 143800, 142308, 142308,
]

const X_LABELS = ['Jun 1', 'Jun 5', 'Jun 9', 'Jun 13', 'Jun 17', 'Jun 21', 'Jun 25', 'Jun 30']

const TIME_RANGES = ['1D', '1W', '1M', '3M', '1Y'] as const
type TimeRange = (typeof TIME_RANGES)[number]

const CURRENCIES = [
  { key: 'all', label: 'All', flag: null },
  { key: 'usd', label: 'USD', flag: 'usd' },
  { key: 'eur', label: 'EUR', flag: 'eur' },
  { key: 'gbp', label: 'GBP', flag: 'gbp' },
] as const

function buildPath(values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = WIDTH / (values.length - 1)
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = HEIGHT - ((v - min) / range) * (HEIGHT - 16) - 8
    return { x, y }
  })

  let line = `M ${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midX = (prev.x + curr.x) / 2
    line += ` C ${midX},${prev.y} ${midX},${curr.y} ${curr.x},${curr.y}`
  }
  const area = `${line} L ${points[points.length - 1].x},${HEIGHT} L ${points[0].x},${HEIGHT} Z`
  return { line, area, points }
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export default function BalanceChart({
  flagIcons,
  empty = false,
}: {
  flagIcons: Record<'usd' | 'eur' | 'gbp', string>
  /** A business that isn't active yet: every figure is $0.00 and the line is flat. */
  empty?: boolean
}) {
  const [activeRange, setActiveRange] = useState<TimeRange>('1M')
  const [activeCurrency, setActiveCurrency] = useState<(typeof CURRENCIES)[number]['key']>('all')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const series = useMemo(() => (empty ? VALUES.map(() => 0) : VALUES), [empty])
  const { line, area, points } = useMemo(() => {
    if (!empty) return buildPath(series)
    // Flat line about a third of the way down, as in the not-yet-active Home (48029:228418).
    const y = HEIGHT * 0.3
    const pts = series.map((_, i) => ({ x: (i * WIDTH) / (series.length - 1), y }))
    return { line: `M 0,${y} L ${WIDTH},${y}`, area: `M 0,${y} L ${WIDTH},${y} L ${WIDTH},${HEIGHT * 0.6} L 0,${HEIGHT * 0.6} Z`, points: pts }
  }, [empty, series])

  const handleMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const relX = ((event.clientX - rect.left) / rect.width) * WIDTH
    if (empty) return
    const stepX = WIDTH / (VALUES.length - 1)
    const idx = Math.max(0, Math.min(VALUES.length - 1, Math.round(relX / stepX)))
    setHoverIndex(idx)
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex w-full flex-col gap-4 border-b border-[#f1f1f3] pb-6">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <p className="text-xs font-medium text-[#555354]">Total Account Balance</p>
            <p className="font-heading text-[36px] leading-10 text-text-primary">{empty ? '$0.00' : '$142,308.00'}</p>
          </div>
          <div className="flex items-center gap-12">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-[3px] bg-[#0e9e74]" />
                <p className="text-xs font-medium text-[#555354]">Money in</p>
              </div>
              <p className="font-heading text-xl leading-7 tracking-[-0.2px] text-text-primary">{empty ? '$0.00' : '$28,140.00'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-[3px] bg-[#667085]" />
                <p className="text-xs font-medium text-[#555354]">Money out</p>
              </div>
              <p className="font-heading text-xl leading-7 tracking-[-0.2px] text-text-primary">{empty ? '$0.00' : '$16,020.00'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-[#555354]">Net</p>
              <p className="font-heading text-xl leading-7 tracking-[-0.2px] text-text-primary">{empty ? '+$0.00' : '+$12,120.00'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          {CURRENCIES.map((currency) => {
            const active = activeCurrency === currency.key
            return (
              // HDS Toggle Segment item styling (pill; active #111927 / #f5f6f8, idle #f5f6f8 / #4b5563).
              <button
                key={currency.key}
                type="button"
                aria-pressed={active}
                onClick={() => setActiveCurrency(currency.key)}
                className={`flex h-7 items-center gap-1 rounded-full px-3 text-xs font-medium transition-colors duration-200 ${ active ? 'bg-[#111927] text-[#f5f6f8]' : 'bg-[#f5f6f8] text-[#4b5563] hover:text-[#111927]' }`}
              >
                {currency.flag && <img src={flagIcons[currency.flag]} alt="" className="size-[10px]" />}
                {currency.label}
              </button>
            )
          })}
        </div>
        <HdsToggleSegment size="sm" value={activeRange} onChange={setActiveRange} options={TIME_RANGES.map((range) => ({ value: range, label: range }))} />
      </div>

      <div className="flex w-full flex-col gap-2">
        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            preserveAspectRatio="none"
            className="w-full cursor-crosshair"
            style={{ height: HEIGHT }}
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="balance-area-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a9e0" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#00a9e0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#balance-area-fill)" stroke="none" />
            <path d={line} fill="none" stroke="#111927" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            {hovered && (
              <g>
                <line
                  x1={hovered.x}
                  y1={0}
                  x2={hovered.x}
                  y2={HEIGHT}
                  stroke="#d3d5d9"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle cx={hovered.x} cy={hovered.y} r={4} fill="#00a9e0" stroke="white" strokeWidth={2} />
              </g>
            )}
          </svg>
          {hovered && hoverIndex !== null && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-bg-inverted px-2.5 py-1.5 text-xs font-medium text-white shadow-lg"
              style={{ left: `${(hovered.x / WIDTH) * 100}%`, top: Math.max(hovered.y - 10, 0) }}
            >
              {formatCurrency(VALUES[hoverIndex])}
            </div>
          )}
        </div>
        <div className="flex w-full items-center justify-between px-0.5">
          {X_LABELS.map((label) => (
            <span key={label} className="text-xs text-[#555354]">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
