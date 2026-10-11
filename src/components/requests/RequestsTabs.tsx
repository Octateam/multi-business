export type RequestsTab = 'all' | 'pending' | 'closed'

// Tabs — Figma 42563:376054 (All · Pending · Closed with counts). Click switches the table's scope.
export default function RequestsTabs({
  active = 'all',
  counts = { all: 8, pending: 5, closed: 12 },
  onChange,
}: {
  active?: RequestsTab
  counts?: Record<RequestsTab, number>
  onChange?: (tab: RequestsTab) => void
}) {
  const tabs: { id: RequestsTab; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'closed', label: 'Closed' },
  ]
  return (
    <div role="tablist" className="flex w-full items-end gap-8 border-b border-[#e1e4e9]">
      {tabs.map((t) => {
        const on = active === t.id
        return (
          <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => onChange?.(t.id)} className="group flex flex-col items-center gap-3">
            <span className="flex items-center gap-2">
              <span className={`text-base ${on ? 'font-semibold text-[#1a1d23]' : 'font-medium text-[#6b7280] group-hover:text-[#1a1d23]'}`}>{t.label}</span>
              <span className={`flex min-w-6 items-center justify-center rounded-pill px-2 py-0.5 text-[13px] font-medium ${on ? 'bg-[#1a1d23] text-white' : 'bg-[#edeff2] text-[#6b7280]'}`}>
                {counts[t.id]}
              </span>
            </span>
            <span className={`h-[3px] w-full rounded-t ${on ? 'bg-[#1a1d23]' : 'bg-transparent'}`} />
          </button>
        )
      })}
    </div>
  )
}
