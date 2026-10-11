import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DropdownMenu } from '../ui/hds'
import type { ExpenseCategory } from '../../data/requests'
import flagUs from '../../assets/icons/dashboard-flag-us.svg'
import chevronDown from '../../assets/icons/dashboard-chevron-down.svg'
import arrowRightSharp from '../../assets/icons/dashboard-arrow-right-sharp.svg'
import statArrow from '../../assets/icons/dashboard-stat-arrow.svg'
import laptopIcon from '../../assets/icons/dashboard-category-laptop.svg'
import travelIcon from '../../assets/icons/dashboard-category-travel.svg'
import mealsIcon from '../../assets/icons/dashboard-category-meals.svg'
import servicesIcon from '../../assets/icons/dashboard-category-services.svg'

const categoryIcons: Record<ExpenseCategory['iconKey'], string | null> = {
  laptop: laptopIcon,
  travel: travelIcon,
  meals: mealsIcon,
  services: servicesIcon,
  others: null,
}

export default function ExpenseOverview({
  total,
  newRequestsLabel,
  categories,
  statTiles,
  onStatClick,
  onNewRequests,
}: {
  total: string
  newRequestsLabel: string | null
  categories: ExpenseCategory[]
  statTiles: { label: string; value: string }[]
  /** When given, tiles filter the list in place instead of navigating. */
  onStatClick?: (label: string) => void
  /** Opens the "New requests" drawer (Figma 44999:332686). */
  onNewRequests?: () => void
}) {
  return (
    <div className="flex w-full items-start justify-between">
      <div className="flex flex-col items-start gap-4 pr-8">
        <div className="flex w-full flex-col gap-[13px] border-b border-surface-3 pb-3">
          <div className="flex w-full items-center justify-between">
            <p className="text-base font-medium text-[#555354]">Expense overview</p>
            <RangePicker />
          </div>
          <div className="flex w-full flex-col justify-center gap-4">
            <div className="flex w-[370px] flex-col gap-2">
              <div className="flex items-start gap-2 py-[6.5px]">
                <img src={flagUs} alt="" className="size-4" />
                <p className="whitespace-nowrap font-heading text-[36px] font-bold leading-10 tracking-[-0.4px] text-[#111011]">
                  {total}
                </p>
              </div>
              {newRequestsLabel && (
                <div className="flex w-full items-center">
                  <button type="button" onClick={onNewRequests} className="group flex items-center gap-1 rounded hover:underline">
                    <span className="text-[10px] font-medium text-[#2d2d2d]">{newRequestsLabel}</span>
                    <img src={arrowRightSharp} alt="" className="h-[13px] w-[7.6px] transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-start justify-end gap-1">
                {categories.map((category) => (
                  <span
                    key={category.label}
                    className="h-2 rounded-pill"
                    style={{ backgroundColor: category.color, width: 40 + category.label.length * 3 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 py-2">
          {categories.map((category) => (
            <div key={category.label} className="flex w-[128px] items-start gap-1.5">
              <div className="flex items-center py-0.5">
                <span
                  className="size-2 shrink-0 rounded-pill"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-1">
                  {categoryIcons[category.iconKey] && (
                    <img src={categoryIcons[category.iconKey]!} alt="" className="size-2.5" />
                  )}
                  <span className="whitespace-nowrap text-[10px] font-medium text-text-quaternary">
                    {category.label}
                  </span>
                </div>
                <p className="whitespace-nowrap font-heading text-base font-medium text-text-primary">
                  {category.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex h-[206px] flex-col justify-center gap-1.5">
        <div className="flex flex-[1_0_0] items-center gap-1.5">
          {statTiles.slice(0, 2).map((tile) => (
            <StatTile key={tile.label} {...tile} onClick={onStatClick} />
          ))}
        </div>
        <div className="flex flex-[1_0_0] items-center gap-1.5">
          {statTiles.slice(2, 4).map((tile) => (
            <StatTile key={tile.label} {...tile} onClick={onStatClick} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Date range for the overview — options as designed (Figma 37453:198095).
const RANGES = ['Today', 'Last 7 days', 'Last 30 days', 'Last 60 days', 'Last 90 days'].map((r) => ({ value: r, label: r }))

function RangePicker() {
  const [value, setValue] = useState('Last 30 days')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} className="flex items-center gap-1 rounded-md hover:bg-[#edeff2]">
        <span className="px-1 text-sm text-[#384250]">{value}</span>
        <img src={chevronDown} alt="" className={`size-5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[180px]">
          <DropdownMenu
            options={RANGES}
            value={value}
            onSelect={(v) => {
              setValue(v)
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )
}

// Stat tiles filter the Requests list by that metric.
function StatTile({ label, value, onClick }: { label: string; value: string; onClick?: (label: string) => void }) {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => (onClick ? onClick(label) : navigate('/requests', { state: { stat: label } }))}
      className="flex h-full w-[140px] flex-[1_0_0] flex-col items-start justify-between rounded-lg border-[0.5px] border-surface-3 p-4 text-left transition-colors hover:border-[#cbd0d8] hover:bg-white"
    >
      <p className="w-full text-[11px] font-medium text-text-primary">{label}</p>
      <div className="flex w-full items-center justify-between">
        <p className="font-heading text-xl font-medium tracking-[-0.2px] text-text-primary">{value}</p>
        <img src={statArrow} alt="" className="size-4" />
      </div>
    </button>
  )
}
