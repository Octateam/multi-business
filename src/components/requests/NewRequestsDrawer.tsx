import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { HdsBadge, HdsButton } from '../ui/hds'
import { TYPE_COLOR, type RequestRow } from '../../data/requests'
import { detailPathFor } from '../../data/requestStore'
import { RowActions } from './RequestsTable'
import selfBadgeIcon from '../../assets/icons/dashboard-self-badge.svg'

/*
 * "New requests" side drawer — Figma 44999:332686. Opens from the "N new requests →" link on the Requests
 * overview: slides in from the right over a full-screen dark overlay, 40px inset, 16px radius. Same columns
 * as the design (Payee + ref, Type, Requested by, Amount, Request date, Due date) and the designed row ⋯
 * actions. Closes on the X, Escape or an overlay click (sliding back out).
 */

const DUE_TONE: Record<RequestRow['dueNoteTone'], string> = { error: 'text-[#b4232e]', warning: 'text-[#ff8b39]', muted: 'text-[#9aa1ac]' }

const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export default function NewRequestsDrawer({ open, rows, onClose }: { open: boolean; rows: RequestRow[]; onClose: () => void }) {
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(open)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setLeaving(false)
      return
    }
    if (!mounted) return
    setLeaving(true)
    const t = window.setTimeout(() => {
      setMounted(false)
      setLeaving(false)
    }, 220)
    return () => window.clearTimeout(t)
  }, [open, mounted])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const scroller = document.querySelector<HTMLElement>('[data-app-scroll]')
    const prev = scroller?.style.overflowY
    if (scroller) scroller.style.overflowY = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      if (scroller) scroller.style.overflowY = prev ?? ''
    }
  }, [open, onClose])

  if (!mounted) return null
  const cols = 'grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_40px]'

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-[#111927]/50 transition-opacity duration-200 ${leaving ? 'opacity-0' : 'animate-[fadeIn_200ms_ease-out]'}`}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label="New requests"
        className={`fixed bottom-10 right-10 top-10 z-[61] flex w-[1021px] max-w-[calc(100vw-80px)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl transition-transform duration-200 ease-in ${ leaving ? 'translate-x-[calc(100%+40px)]' : 'animate-[slideInRight_320ms_cubic-bezier(.2,.8,.2,1)]' }`}
      >
        <header className="flex items-center justify-between gap-4 px-6 pb-5 pt-8">
          <h2 className="font-heading text-2xl font-semibold leading-8 tracking-[-0.24px] text-[#222121]">New requests</h2>
          <HdsButton variant="secondary" size="sm" iconOnly aria-label="Close" onClick={onClose} leadingIcon={<CloseGlyph />} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
          <div className={`sticky top-0 z-10 grid ${cols} items-center gap-3 rounded-lg bg-[#efefef] px-2.5 py-2.5 text-sm font-medium text-[#525866]`}>
            <span>Payee</span>
            <span>Type</span>
            <span>Requested by</span>
            <span>Amount</span>
            <span>Request date</span>
            <span>Due date</span>
            <span />
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              role="link"
              tabIndex={0}
              onClick={() => navigate(detailPathFor(row))}
              onKeyDown={(e) => e.key === 'Enter' && navigate(detailPathFor(row))}
              className={`grid ${cols} cursor-pointer items-center gap-3 border-b border-[#e1e4e9] px-2.5 py-3.5 transition-colors hover:bg-[#f5f6f8]`}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-[#222121]">{row.payee}</span>
                <span className="truncate text-xs text-[#9aa1ac]">{row.refId}</span>
              </span>
              <span>
                <HdsBadge color={TYPE_COLOR[row.type]}>{row.type}</HdsBadge>
              </span>
              <span className="flex min-w-0 items-center gap-1">
                {row.requestedByIsSelf && (
                  <span className="flex items-center rounded-full bg-[#dbefdc] p-0.5" title="You">
                    <img src={selfBadgeIcon} alt="" className="h-[7px] w-[4.33px]" />
                  </span>
                )}
                <span className="truncate text-sm font-medium text-[#222121]">{row.requestedBy}</span>
              </span>
              <span className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.amount}</span>
              <span className="flex flex-col">
                <span className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.requestDate}</span>
                <span className="whitespace-nowrap text-xs text-[#9aa1ac]">{row.requestTime}</span>
              </span>
              <span className="flex flex-col">
                <span className="whitespace-nowrap text-sm font-medium text-[#0e121b]">{row.dueDate ?? '--'}</span>
                {row.dueNote && <span className={`whitespace-nowrap text-xs ${DUE_TONE[row.dueNoteTone]}`}>{row.dueNote}</span>}
              </span>
              <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                <RowActions row={row} onView={() => navigate(detailPathFor(row))} />
              </span>
            </div>
          ))}
        </div>
      </section>
    </>,
    document.body,
  )
}
