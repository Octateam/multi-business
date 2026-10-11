import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Chevron, DropdownMenu, HdsBadge, HdsButton, HdsInput, HdsSearch, inputRowClass } from '../../components/ui/hds'
import { NETWORK_LOGO, type AccountStatus, type NetworkName } from './data'

// Closes a popover on outside mousedown or Escape. Menus in this section only ever open on click.
export function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose()
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])
  return ref
}

export type MenuItem = { label: string; icon: string; onSelect?: () => void; tone?: 'default' | 'danger' }

// Row / page action menu — Figma 47582:383115 (main row), 47582:382130 (yield row), 47582:383145 (detail).
// Styled as the HDS dark _Dropdown Menu (HDS Select 1588:5747): bg #111927, radius 8, padding 6, gap 2,
// 40px items, radius 10, 14px white text, hover #4b5563. The line icons are inverted to sit on the dark menu.
export function ActionMenu({
  items,
  trigger,
  align = 'right',
}: {
  items: MenuItem[]
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode
  /** Kept for existing call sites; HDS menus have a single size. */
  size?: 'sm' | 'md'
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))

  return (
    <div ref={ref} className="relative">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open && (
        <div
          role="menu"
          className={`absolute top-[calc(100%+6px)] z-30 flex min-w-[200px] animate-[popIn_140ms_ease-out] flex-col gap-0.5 rounded-lg bg-[#111927] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-6px_rgba(16,24,40,0.25)] ${ align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left' }`}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={(event) => {
                event.stopPropagation()
                setOpen(false)
                item.onSelect?.()
              }}
              className={`flex min-h-10 w-full items-center gap-2.5 whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-left text-sm leading-5 transition-colors hover:bg-[#4b5563] ${ item.tone === 'danger' ? 'text-[#f18d95]' : 'text-white' }`}
            >
              <img src={item.icon} alt="" className="size-4 shrink-0 opacity-80 brightness-0 invert" />
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Status → HDS Badge (Figma HDS 798:7): Active = green, Pending = amber, both with the status dot.
export function StatusPill({ status }: { status: AccountStatus }) {
  return status === 'active' ? (
    <HdsBadge color="green" dot>
      Active
    </HdsBadge>
  ) : (
    <HdsBadge color="amber" dot>
      Pending
    </HdsBadge>
  )
}

// Side drawer used by every flow: portalled so no transformed ancestor traps it, full-screen dark
// overlay, 16px radius, 40px from the top, bottom and right edges, page scroll locked while open.
// Slides in from the right (starts fully off-screen, 450ms sheet easing) while the overlay fades in; reverses on close.
export function Drawer({ open, onClose, children, width = 513 }: { open: boolean; onClose: () => void; children: ReactNode; width?: number }) {
  const [mounted, setMounted] = useState(open)

  // Entering uses a CSS keyframe (drawer-sheet-in) so it always starts fully off-screen, however busy the page is;
  // leaving transitions back out, then unmounts.
  useEffect(() => {
    if (open) {
      setMounted(true)
      return
    }
    const timer = window.setTimeout(() => setMounted(false), 450)
    return () => window.clearTimeout(timer)
  }, [open])
  const shown = open

  useEffect(() => {
    if (!mounted) return
    const scroller = document.querySelector<HTMLElement>('[data-app-scroll]')
    const targets = [document.body, scroller].filter(Boolean) as HTMLElement[]
    const previous = targets.map((el) => [el.style.overflowY, el.style.paddingRight] as const)
    targets.forEach((el) => {
      const gutter = el === document.body ? window.innerWidth - document.documentElement.clientWidth : el.offsetWidth - el.clientWidth
      el.style.overflowY = 'hidden'
      if (gutter > 0) el.style.paddingRight = `${gutter}px`
    })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      targets.forEach((el, i) => {
        el.style.overflowY = previous[i][0]
        el.style.paddingRight = previous[i][1]
      })
      document.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

  if (!mounted) return null
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-[#111927]/50 transition-opacity duration-[450ms] ease-out ${shown ? 'drawer-overlay-in opacity-100' : 'opacity-0'}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        style={{ width }}
        className={`absolute bottom-10 right-10 top-10 flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(17,25,39,0.18)] transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${ shown ? 'drawer-sheet-in translate-x-0' : 'translate-x-[calc(100%+40px)]' }`}
      >
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}

export type SelectOption = { value: string; label: string; icon?: string | ReactNode; description?: string; meta?: ReactNode; group?: string }

const optionIcon = (icon: SelectOption['icon']) =>
  typeof icon === 'string' ? <img src={icon} alt="" className="size-5 shrink-0 rounded-full object-cover" /> : icon

// Field label row (HDS: 14px medium #111927, 6px gap to the control).
function FieldLabel({ label }: { label?: ReactNode }) {
  if (!label) return null
  return typeof label === 'string' ? <p className="text-sm font-medium leading-5 text-[#111927]">{label}</p> : <>{label}</>
}

// HDS Select (1588:5747) — the Input row trigger (44px, #f5f6f8, 0.5px #edeff2, radius 8) with a chevron; open =
// 1px #004b87 border + the dark HDS _Dropdown Menu. The list sits in the flow under the field (pushing the form
// down) exactly as in the accounts designs (Figma 47582:379965 / 47582:380152). Searchable when long.
export function Select({
  label,
  placeholder,
  value,
  options,
  onChange,
  trigger,
  helper,
  searchable,
  searchPlaceholder,
}: {
  label?: ReactNode
  placeholder: string
  value: string | null
  options: SelectOption[]
  onChange: (value: string) => void
  trigger?: (props: { open: boolean; selected: SelectOption | undefined }) => ReactNode
  helper?: ReactNode
  searchable?: boolean
  searchPlaceholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const selected = options.find((option) => option.value === value)

  return (
    <div ref={ref} className="flex w-full flex-col gap-1.5">
      <FieldLabel label={label} />
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#004b87]/40"
      >
        {trigger ? (
          trigger({ open, selected })
        ) : (
          <span className={`${inputRowClass({ focus: open })} h-11`}>
            {selected?.icon && <span className="flex shrink-0 items-center">{optionIcon(selected.icon)}</span>}
            <span className={`min-w-0 flex-1 truncate text-sm leading-5 ${selected ? 'text-[#111927]' : 'text-[#9aa1ac]'}`}>{selected?.label ?? placeholder}</span>
            <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />
          </span>
        )}
      </button>
      {open && (
        <DropdownMenu
          options={options.map((o) => ({ value: o.value, label: o.label, icon: optionIcon(o.icon), description: o.description, meta: o.meta, group: o.group }))}
          value={value}
          searchable={searchable ?? options.length > 8}
          searchPlaceholder={searchPlaceholder}
          maxHeight={320}
          onSelect={(v) => {
            onChange(v)
            setOpen(false)
          }}
        />
      )}
      {!open && helper && <p className="text-[11px] leading-4 text-[#6b7280]">{helper}</p>}
    </div>
  )
}

// HDS Input field (798:3) — 44px row, #f5f6f8, 0.5px #edeff2, radius 8, focus 1px #004b87; 11px helper.
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  optional,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  helper?: string
  optional?: boolean
}) {
  return <HdsInput label={label} optional={optional} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} helper={helper} />
}

// Primary submit (HDS Button 798:2, Primary/md, full width): disabled styling until every required field is provided.
export function PrimaryButton({ disabled, loading, onClick, children }: { disabled?: boolean; loading?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    // While loading the button keeps its Primary fill so the white spinner stays visible.
    <HdsButton variant="primary" size="md" fullWidth disabled={disabled} loading={loading} onClick={onClick} className={loading ? 'disabled:!bg-[#111927] disabled:!text-white' : undefined}>
      {children}
    </HdsButton>
  )
}

// HDS Search (1958:11) for list toolbars.
export function SearchField({ value, onChange, placeholder, className = 'w-[300px]' }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string }) {
  return <HdsSearch value={value} onChange={onChange} placeholder={placeholder} className={className} />
}

export type FilterGroup = { key: string; title: string; options: { value: string; label: string }[] }

// "Filter" toolbar button (HDS Button ghost/sm) that opens the dark HDS menu as a grouped multi-select.
// Selected values are keyed `${group}:${value}`; the button shows how many filters are applied.
export function FilterMenu({
  groups,
  selected,
  onChange,
  icon,
  align = 'left',
}: {
  groups: FilterGroup[]
  selected: string[]
  onChange: (next: string[]) => void
  icon: string
  align?: 'left' | 'right'
}) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const options = groups.flatMap((g) => g.options.map((o) => ({ value: `${g.key}:${o.value}`, label: o.label, group: g.title })))
  return (
    <div ref={ref} className="relative">
      <HdsButton
        variant="ghost"
        size="sm"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        leadingIcon={<img src={icon} alt="" className="size-[14.33px]" />}
        trailingIcon={
          selected.length > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#111927] px-1.5 text-[11px] font-medium text-white">{selected.length}</span>
          ) : undefined
        }
        // On the grey page canvas the quiet button uses the next tertiary step (#edeff2 → hover/open #e1e4e9).
        className={open ? '!bg-[#e1e4e9]' : '!bg-[#edeff2] hover:!bg-[#e1e4e9]'}
      >
        Filter
      </HdsButton>
      {open && (
        <div className={`absolute top-[calc(100%+6px)] z-30 w-[260px] ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <DropdownMenu
            multiple
            options={options}
            values={selected}
            maxHeight={340}
            onSelect={(v) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])}
            footer={
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => onChange([])}
                className="flex h-9 w-full items-center rounded-[10px] px-3.5 text-left text-[13px] font-medium text-[#9aa1ac] transition-colors hover:bg-[#4b5563] hover:text-white disabled:pointer-events-none disabled:opacity-40"
              >
                Clear filters
              </button>
            }
          />
        </div>
      )}
    </div>
  )
}

/** Values of one filter group from a FilterMenu selection. */
export const filterValues = (selected: string[], key: string) => selected.filter((s) => s.startsWith(`${key}:`)).map((s) => s.slice(key.length + 1))

// Network logos are raster marks; Stellar's source is a wide canvas, cropped exactly as in Figma.
export function NetworkLogo({ network, className = 'size-5' }: { network: NetworkName; className?: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
      <img
        src={NETWORK_LOGO[network]}
        alt=""
        className={network === 'Stellar' ? 'absolute left-[-29.33%] top-[-9.5%] h-[119%] w-[158.67%] max-w-none' : 'absolute inset-0 size-full object-cover'}
      />
    </span>
  )
}

// Country flag chip — the flag SVGs carry their own drop shadow, so they overflow their 16px box.
export function Flag({ src, size = 16 }: { src: string; size?: number }) {
  return (
    <span className="relative block shrink-0" style={{ width: size, height: size }}>
      <img src={src} alt="" className="absolute max-w-none" style={{ left: -size / 8, top: -size / 16, width: size * 1.25, height: size * 1.25 }} />
    </span>
  )
}

// Improved Version: every page-level action collapses into one dark "Actions" button (HDS Primary/md + chevron).
export function ActionsButton({ items }: { items: MenuItem[] }) {
  return (
    <ActionMenu
      items={items}
      trigger={({ open, toggle }) => (
        <HdsButton variant="primary" onClick={toggle} aria-haspopup="menu" aria-expanded={open} trailingIcon={<Chevron open={open} />}>
          Actions
        </HdsButton>
      )}
    />
  )
}

export function useToast() {
  const [message, setMessage] = useState<string | null>(null)
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(null), 2600)
    return () => window.clearTimeout(timer)
  }, [message])
  const node = message
    ? createPortal(
        <div
          role="status"
          className="fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 animate-[rise_220ms_ease-out] rounded-xl bg-[#111927] px-4 py-3 text-sm font-medium text-white shadow-[0_12px_32px_rgba(17,25,39,0.25)]"
        >
          {message}
        </div>,
        document.body,
      )
    : null
  return [node, setMessage] as const
}
