import { useEffect, useState, type MouseEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import orgLogo from '../../assets/img/org-logo-mark.png'
import chevronSmall from '../../assets/icons/chevron-small.svg'
import addBusinessIcon from '../../assets/icons/switcher-add-business.svg'
import linkBusinessIcon from '../../assets/icons/switcher-link-business.svg'
import manageBusinessesIcon from '../../assets/icons/switcher-manage-businesses.svg'
import moreHorizontalIcon from '../../assets/icons/switcher-more-horizontal.svg'
import ringTrack from '../../assets/icons/switcher-ring-track.svg'
import ringProgressBlue from '../../assets/icons/switcher-ring-progress-blue.svg'
import ringProgressRed from '../../assets/icons/switcher-ring-progress-red.svg'
import ringProgressGray from '../../assets/icons/switcher-ring-progress-gray.svg'
import ringAlertDot from '../../assets/icons/switcher-ring-alert-dot.svg'
import ringDashed from '../../assets/icons/switcher-ring-dashed.png'
import leaveModalCloseIcon from '../../assets/icons/switcher-leave-modal-close.svg'
import switchingInfoIcon from '../../assets/icons/switcher-info-icon.svg'
import fallbackWarningIcon from '../../assets/icons/switcher-fallback-warning-icon.svg'
import toastCloseIcon from '../../assets/icons/switcher-toast-close.svg'
import { useBusinessContext } from '../../context/BusinessContext'
import BusinessNotActiveModal, { needsKyb } from '../business/BusinessNotActiveModal'
import {
  BUSINESS_STATUS_ACCENT,
  BUSINESS_STATUS_HINT,
  BUSINESS_STATUS_RING,
} from '../../lib/businessStatus'
import { STATUS_LABEL, type Business } from '../../data/businesses'
import { HdsBadge, HdsButton } from '../ui/hds'

// Routes that represent a multi-step flow the user could lose progress in —
// Switcher 05 ("Leave this process?") warns before switching business while
// on one of these. Simple pathname-prefix heuristic per the task brief, not a
// generic "dirty form" detector.
const MULTI_STEP_FLOW_PREFIXES = ['/businesses/add/', '/bills/add/', '/claim-reimbursement', '/pay-vendor']

function isInMultiStepFlow(pathname: string) {
  return MULTI_STEP_FLOW_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/** The 44x44 avatar slot used on every dropdown row, with the Figma "status ring" treatment
 * layered behind it for non-active businesses (verified against node 46988:214112). */
function StatusRing({ status, initials }: { status: Business['status']; initials: string }) {
  const ring = BUSINESS_STATUS_RING[status]
  return (
    <div className="relative size-[44px] shrink-0">
      {ring === 'blue' && (
        <>
          <img src={ringTrack} alt="" className="absolute left-0 top-0 size-[44px]" />
          <img src={ringProgressBlue} alt="" className="absolute left-[6.7%] top-0 h-[44px] w-[41.05px]" />
        </>
      )}
      {ring === 'red' && (
        <>
          <img src={ringTrack} alt="" className="absolute left-0 top-0 size-[44px]" />
          <img src={ringProgressRed} alt="" className="absolute left-[6.7%] top-0 h-[44px] w-[41.05px]" />
          <img src={ringAlertDot} alt="" className="absolute left-[32px] top-0 size-[12px]" />
        </>
      )}
      {ring === 'gray' && (
        <>
          <img src={ringTrack} alt="" className="absolute left-0 top-0 size-[44px]" />
          <img src={ringProgressGray} alt="" className="absolute right-0 top-0 h-[33px] w-[22px]" />
        </>
      )}
      {ring === 'dashed' && <img src={ringDashed} alt="" className="absolute left-px top-px size-[42px]" />}
      <div
        className={`absolute left-[4px] top-[4px] flex size-9 items-center justify-center rounded-pill bg-[#2a2f38] font-heading text-sm font-medium text-[#f5f6f8] ${
          ring === 'dashed' ? 'opacity-55' : ''
        }`}
      >
        {initials}
      </div>
    </div>
  )
}

type RowMenuItem = { label: string; onClick: () => void }

/** Dark context menu that opens under a row's "..." button (Figma node 46988:214181), on the HDS
 * _Dropdown Menu spec: bg #111927, radius 8, padding 6, gap 2, 40px items (radius 10, 14px), hover #4b5563.
 * A hairline keeps it readable on the near-black switcher panel. */
function RowMenu({ items }: { items: RowMenuItem[] }) {
  return (
    <div
      role="menu"
      className="absolute right-2 top-full z-20 mt-1 flex w-[200px] animate-[popIn_140ms_ease-out] flex-col gap-0.5 rounded-lg border border-white/10 bg-[#111927] p-1.5 shadow-[0px_10px_24px_0px_rgba(0,0,0,0.5)]"
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          onClick={item.onClick}
          className="flex min-h-10 w-full items-center rounded-[10px] px-3.5 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#4b5563]"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

// Hidden until its row is hovered (or keyboard-focused); stays visible while its menu is open.
function MoreButton({ label, open, onClick }: { label: string; open: boolean; onClick: (e: MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-haspopup="menu"
      aria-expanded={open}
      className={`flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 transition-opacity hover:bg-white/20 focus-visible:opacity-100 group-hover:opacity-100 ${
        open ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <img src={moreHorizontalIcon} alt="" className="h-[1.67px] w-[9.67px]" />
    </button>
  )
}

/**
 * The business pill from TopBar, made interactive. Rebuilt from Figma's "Multi-Business Access &
 * Management" section (file XWbFOsBSyeBTrk7EpLB5Kq) — the open dropdown is now the dark "Concept A
 * — Progress ring" panel used across Switcher 01/02/03, with real wiring for the restricted-business
 * modal (04), the unfinished-work warning (05), the switching skeleton (06) and the default-business
 * fallback toast (07). See this file's handoff notes for exact node ids and judgment calls.
 */
export default function BusinessSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [notActiveBusiness, setNotActiveBusiness] = useState<Business | null>(null)
  const [leaveWarningTarget, setLeaveWarningTarget] = useState<Business | null>(null)
  const [switchingTo, setSwitchingTo] = useState<Business | null>(null)
  const [fallbackToast, setFallbackToast] = useState<Business | null>(null)

  const navigate = useNavigate()
  const location = useLocation()
  const { businesses, currentBusiness, currentBusinessId, setCurrentBusinessId, defaultBusinessId, setDefaultBusinessId } =
    useBusinessContext()

  const close = () => {
    setIsOpen(false)
    setOpenMenuId(null)
  }

  const goTo = (path: string) => {
    close()
    navigate(path)
  }

  const toggleMenu = (id: string, e: MouseEvent) => {
    e.stopPropagation()
    setOpenMenuId((current) => (current === id ? null : id))
  }

  /** Switcher 06 — shows the skeleton loading state for a beat, then commits the switch. */
  const performSwitch = (business: Business) => {
    setIsOpen(false)
    setOpenMenuId(null)
    setLeaveWarningTarget(null)
    setSwitchingTo(business)
    const delay = 600 + Math.random() * 300 // 600–900ms, per the task brief
    window.setTimeout(() => {
      setCurrentBusinessId(business.id)
      setSwitchingTo(null)
    }, delay)
  }

  /** Switcher 05 — gates the switch behind a confirmation if a multi-step flow is in progress. */
  const requestSwitch = (business: Business) => {
    if (business.id === currentBusinessId) {
      close()
      return
    }
    if (isInMultiStepFlow(location.pathname)) {
      setIsOpen(false)
      setOpenMenuId(null)
      setLeaveWarningTarget(business)
      return
    }
    performSwitch(business)
  }

  /** Switcher 04 — a business that still needs KYB can be entered (its Home shows the empty, not-yet-active
   * state and every action asks for KYB). Businesses in review or awaiting approval stay restricted and
   * open the explainer modal instead. */
  const handleRowClick = (business: Business) => {
    if (needsKyb(business.status)) {
      requestSwitch(business)
      return
    }
    if (business.status !== 'active') {
      setIsOpen(false)
      setOpenMenuId(null)
      setNotActiveBusiness(business)
      return
    }
    requestSwitch(business)
  }

  // RowMenu (below) stops click propagation for all of its items, so these handlers don't need to
  // touch the event themselves.
  const handleSetDefault = (business: Business) => {
    setDefaultBusinessId(business.id)
    setOpenMenuId(null)
  }

  const handleTeam = () => {
    goTo('/team')
  }

  const handleContinueKyb = () => {
    close()
    navigate('/businesses/add/company')
  }

  /** Switcher 07 demo affordance — there's no backend to naturally expire a default business in
   * this prototype, so this reproduces the scenario on demand: pretend the stored default just
   * became unavailable and the app silently opened a different active business instead. The
   * default itself is deliberately left unchanged (the toast tells the user to fix it manually in
   * Manage businesses). */
  const simulateFallback = () => {
    const fallback = businesses.find((b) => b.status === 'active' && b.id !== defaultBusinessId) ?? businesses[0]
    setIsOpen(false)
    setOpenMenuId(null)
    setCurrentBusinessId(fallback.id)
    setFallbackToast(fallback)
    window.setTimeout(() => setFallbackToast(null), 6000)
  }

  // The panel and its row menus close on Escape as well as on an outside click.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openMenuId) setOpenMenuId(null)
      else setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, openMenuId])

  const activeBusinesses = businesses.filter((b) => b.status === 'active')
  const nonActiveBusinesses = businesses.filter((b) => b.status !== 'active')
  const singleBusiness = businesses.length === 1

  const renderActiveRow = (business: Business) => {
    const isCurrent = business.id === currentBusinessId
    const isDefault = business.id === defaultBusinessId
    return (
      <div key={business.id} className="relative">
        <div
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 ${
            openMenuId === business.id ? 'bg-white/5' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => handleRowClick(business)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <StatusRing status="active" initials={business.initials} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-sm font-medium text-[#f5f6f8]">{business.name}</p>
              <p className="truncate text-xs text-[rgba(245,246,248,0.8)]">
                {business.plan} · {business.type}
              </p>
            </div>
          </button>
          {isDefault ? (
            <HdsBadge color="navy" size="sm">
              Default
            </HdsBadge>
          ) : (
            !isCurrent && <MoreButton label={`More actions for ${business.name}`} open={openMenuId === business.id} onClick={(e) => toggleMenu(business.id, e)} />
          )}
        </div>
        {openMenuId === business.id && !isCurrent && (
          <RowMenu
            items={[
              { label: 'Open business', onClick: () => requestSwitch(business) },
              ...(isDefault ? [] : [{ label: 'Set as default', onClick: () => handleSetDefault(business) }]),
              { label: 'Team', onClick: handleTeam },
            ]}
          />
        )}
      </div>
    )
  }

  const renderStatusRow = (business: Business) => {
    const showMenu = business.status === 'kyb-pending'
    const dimmed = business.status === 'pending-approval'
    return (
      <div key={business.id} className="relative">
        <div
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5 ${
            openMenuId === business.id ? 'bg-white/5' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => handleRowClick(business)}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <StatusRing status={business.status} initials={business.initials} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className={`truncate text-sm font-medium ${dimmed ? 'text-[rgba(245,246,248,0.6)]' : 'text-[#f5f6f8]'}`}>
                {business.name}
              </p>
              <p className="truncate text-xs text-[#9ca3af]">
                <span className={`font-medium ${BUSINESS_STATUS_ACCENT[business.status]}`}>{STATUS_LABEL[business.status]}</span>
                {'  ·  '}
                {BUSINESS_STATUS_HINT[business.status]}
              </p>
            </div>
          </button>
          {showMenu && (
            <MoreButton label={`More actions for ${business.name}`} open={openMenuId === business.id} onClick={(e) => toggleMenu(business.id, e)} />
          )}
        </div>
        {openMenuId === business.id && showMenu && (
          <RowMenu items={[{ label: 'Continue KYB', onClick: handleContinueKyb }]} />
        )}
      </div>
    )
  }

  return (
    <>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          className="flex items-center gap-2 rounded-pill bg-surface-2 py-1 pl-1 pr-3 hover:bg-surface-3"
        >
          <div className="flex size-6 items-center justify-center rounded-pill bg-bg-inverted">
            <img src={orgLogo} alt="" className="h-3 w-2.5 object-bottom" />
          </div>
          <p className="text-[11px] font-semibold text-text-primary">{currentBusiness.name}</p>
          <img
            src={chevronSmall}
            alt=""
            className={`h-[5.25px] w-[9.33px] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            <button
              type="button"
              aria-label="Close business switcher"
              className="fixed inset-0 z-30 cursor-default"
              onClick={close}
            />
            <div
              className="absolute left-0 top-full z-40 mt-2 w-[400px] rounded-2xl bg-[#090a0c] p-2 shadow-[0px_12px_32px_0px_rgba(0,0,0,0.35)]"
              onClick={() => setOpenMenuId(null)}
            >
              {/* Current-business header (Figma "Status Modal"). The real Figma mock hardcodes an
                  "acme" wordmark + a stale "Starter plan" subtitle that doesn't match the business
                  it's meant to represent — we bind this to the real current business instead, and
                  use its initials in place of a per-business logo mark we don't have elsewhere in
                  this codebase. */}
              <div className="mb-0.5 flex h-[168px] flex-col items-center justify-center gap-2 rounded-lg bg-[#141414] px-6 text-center">
                <div className="flex size-[49px] items-center justify-center rounded-[10px] bg-black">
                  <span className="font-heading text-lg font-semibold tracking-tight text-white">
                    {currentBusiness.initials}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-white">{currentBusiness.name}</p>
                  <p className="text-xs text-white/70">
                    {currentBusiness.plan} · {currentBusiness.type}
                  </p>
                </div>
              </div>

              {singleBusiness ? (
                <div className="flex flex-col gap-0.5 pb-1 pt-0.5">{renderActiveRow(currentBusiness)}</div>
              ) : (
                <>
                  <div className="flex flex-col gap-0.5 pb-1 pt-0.5">{activeBusinesses.map(renderActiveRow)}</div>
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wide text-[#6b7280]">
                    Your businesses ({businesses.length})
                  </p>
                  <div className="h-px w-full bg-[#3b424e]" />
                  <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto pt-1">
                    {nonActiveBusinesses.map(renderStatusRow)}
                  </div>
                </>
              )}

              <div className="my-1.5 h-px w-full bg-[#3b424e]" />

              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => goTo('/businesses/add')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#f5f6f8] hover:bg-white/5"
                >
                  <img src={addBusinessIcon} alt="" className="h-[10.67px] w-[10.67px]" />
                  Add a new business
                </button>
                <button
                  type="button"
                  onClick={() => goTo('/businesses/link')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#f5f6f8] hover:bg-white/5"
                >
                  <img src={linkBusinessIcon} alt="" className="h-[14.33px] w-[10.33px]" />
                  Link an existing business
                </button>
                <button
                  type="button"
                  onClick={() => goTo('/businesses')}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-[#f5f6f8] hover:bg-white/5"
                >
                  <img src={manageBusinessesIcon} alt="" className="h-[14.33px] w-[14.33px]" />
                  Manage businesses
                </button>
              </div>

              {/* Demo-only affordance for Switcher 07 (see simulateFallback above). */}
              <button
                type="button"
                onClick={simulateFallback}
                className="mt-1 w-full rounded-lg px-3 py-1.5 text-left text-[10px] text-white/35 hover:text-white/60"
              >
                Simulate: default business unavailable (demo)
              </button>
            </div>
          </>
        )}
      </div>

      {notActiveBusiness && <BusinessNotActiveModal businessName={notActiveBusiness.name} onClose={() => setNotActiveBusiness(null)} />}

      {leaveWarningTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,11,17,0.55)] px-4">
          <div
            className="relative flex w-[483px] max-w-full flex-col overflow-hidden rounded-[31px]"
            style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(1,106,165) 18.5%, rgb(255,255,255) 78.6%)' }}
          >
            <div className="relative h-[310px] shrink-0 overflow-hidden">
              <div className="absolute left-1/2 top-[118px] h-[298px] w-[336px] -translate-x-1/2 rounded-t-[30px] bg-[#f3f3f3]" />
              <div className="absolute left-1/2 top-[137px] h-[328px] w-[370px] -translate-x-1/2 rounded-t-[32px] bg-white">
                <div className="absolute left-[23px] top-[23px] flex size-16 items-center justify-center rounded-[13px] bg-black">
                  <span className="font-heading text-2xl font-semibold text-white">{currentBusiness.initials}</span>
                </div>
                <div className="absolute left-[23px] top-[133px] h-2.5 w-[316px] rounded-full bg-[#efefef]" />
                <div className="absolute left-[23px] top-[150px] h-2.5 w-[225px] rounded-full bg-[#efefef]" />
              </div>
              <button
                type="button"
                onClick={() => setLeaveWarningTarget(null)}
                aria-label="Close"
                className="absolute right-6 top-6 size-8"
              >
                <img src={leaveModalCloseIcon} alt="" className="size-8" />
              </button>
            </div>
            <div className="flex flex-col gap-8 bg-white p-8">
              <div className="flex flex-col gap-3">
                <p className="font-heading text-[32px] font-semibold tracking-tight text-text-primary">
                  Leave this process?
                </p>
                <p className="text-base text-text-quaternary">
                  Switching businesses will end your current process, and any unsaved progress may be lost.
                </p>
              </div>
              <div className="flex gap-2">
                <HdsButton variant="secondary" size="lg" className="flex-1" onClick={() => setLeaveWarningTarget(null)}>
                  Cancel
                </HdsButton>
                <HdsButton variant="primary" size="lg" className="flex-1" onClick={() => performSwitch(leaveWarningTarget)}>
                  Switch business
                </HdsButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {switchingTo && (
        <div className="fixed bottom-0 left-[275px] right-0 top-[84px] z-40 overflow-hidden bg-surface-2">
          <div className="flex flex-col gap-6 p-9">
            <div className="flex items-start justify-between gap-6">
              <div className="flex flex-col gap-2">
                <div className="h-5 w-[220px] animate-pulse rounded-full bg-surface-3" />
                <div className="h-7 w-[300px] animate-pulse rounded-full bg-surface-3" />
              </div>
              <div className="flex shrink-0 items-start gap-3 rounded-lg border-[0.5px] border-[#004b87] bg-[#eaf2f9] px-4 py-4">
                <img src={switchingInfoIcon} alt="" className="h-[16.125px] w-[16.125px] shrink-0" />
                <p className="text-xs text-[#4b5563]">Switching to {switchingTo.name}…</p>
              </div>
            </div>
            <div className="flex gap-3">
              {[133, 125, 113, 188, 146].map((w, i) => (
                <div key={i} className="h-11 animate-pulse rounded-pill bg-surface-3" style={{ width: w }} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-4 w-40 animate-pulse rounded-full bg-surface-3" />
              <div className="h-10 w-[300px] animate-pulse rounded-full bg-surface-3" />
            </div>
            <div className="h-[300px] w-full animate-pulse rounded-2xl bg-surface-3" />
            <div className="flex gap-4">
              <div className="h-[358px] flex-1 animate-pulse rounded-2xl bg-surface-3" />
              <div className="h-[358px] flex-1 animate-pulse rounded-2xl bg-surface-3" />
            </div>
          </div>
        </div>
      )}

      {fallbackToast && (
        <div className="fixed right-8 top-6 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-[10px] border-[0.5px] border-[#8a6300] bg-[#fff3d6] py-4 pl-4 pr-3.5 shadow-lg">
          <img src={fallbackWarningIcon} alt="" className="h-[14.625px] w-[16.125px] shrink-0" />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm font-semibold text-[#8a6300]">Default business changed</p>
            <p className="text-xs text-[#4b5563]">
              Your default business is no longer available. We opened {fallbackToast.name} instead. You can update your
              default in Manage businesses.
            </p>
          </div>
          <button type="button" onClick={() => setFallbackToast(null)} aria-label="Dismiss" className="shrink-0 opacity-65 hover:opacity-100">
            <img src={toastCloseIcon} alt="" className="h-[10.33px] w-[10.33px]" />
          </button>
        </div>
      )}
    </>
  )
}
