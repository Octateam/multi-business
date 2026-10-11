import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { HdsBadge, HdsButton, HdsInput, HdsSelect, type SelectOption } from '../../components/ui/hds'
import { Link } from 'react-router-dom'
import Home from '../home/Home'
import linkBannerClose from '../../assets/icons/link-banner-close.svg'
import linkBannerPlus from '../../assets/icons/link-banner-plus.svg'
import linkBusinessLogo from '../../assets/icons/link-business-logo.png'
import linkAlertSuccessCheck from '../../assets/icons/link-alert-success-check.svg'
import linkAlertClose from '../../assets/icons/link-alert-close.svg'

/**
 * Shared building blocks for the Multi-Business Access & Management flows
 * ("Add a new business" and "Link an existing business").
 *
 * `FieldInput`/`FieldSelect` below are reused by the "Add a new business"
 * KYB form pages (src/pages/businesses/add/*) — keep their API stable.
 *
 * Everything from `LinkModalBackdrop` down is new: the "Link an existing
 * business" flow is a CENTERED MODAL over the dimmed Home dashboard (node
 * 47038:216116 / 47040:224972 / 47040:225030 / 47107:218165 / 47107:218581 /
 * 47107:218726 / 47107:218874 in Figma file XWbFOsBSyeBTrk7EpLB5Kq), not a
 * full-page card — see src/pages/businesses/link/*.tsx.
 */

export function FieldInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  half,
  error,
  helper,
  suffix,
  inputMode,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  half?: boolean
  error?: string
  helper?: ReactNode
  suffix?: ReactNode
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
}) {
  return (
    <HdsInput
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      error={error}
      helper={helper}
      suffix={suffix}
      inputMode={inputMode}
      containerClassName={half ? 'min-w-[240px] flex-1' : 'w-full'}
    />
  )
}

/** HDS Select (dark dropdown menu; searchable automatically when the list is long). Accepts plain
 * strings or full HDS options (e.g. with a flag icon). */
export function FieldSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  half,
  searchable,
  searchPlaceholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: (string | SelectOption)[]
  placeholder?: string
  half?: boolean
  searchable?: boolean
  searchPlaceholder?: string
}) {
  const opts: SelectOption[] = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o))
  return (
    <HdsSelect
      label={label}
      value={value || null}
      onChange={onChange}
      options={opts}
      placeholder={placeholder}
      searchable={searchable}
      searchPlaceholder={searchPlaceholder}
      className={half ? 'min-w-[240px] flex-1' : 'w-full'}
    />
  )
}

/** Masks a business email for pre-authorization display: keeps the first
 * character of the local part and the full domain, e.g. "f***@brightlogistics.com". */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const first = local.slice(0, 1)
  return `${first}***@${domain}`
}

/** Business logo/initials avatar fallback for businesses without a real
 * logo asset (everything except the Figma demo business, see
 * `FOUND_BUSINESS` below, which has a real logo asset). */
export function BusinessAvatar({ initials, size = 64 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-sidebar-card-bg font-heading font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials}
    </div>
  )
}

/**
 * The one business with a real logo asset in Figma (Status Modal banner +
 * business-match card both use it, node 47040:225030 etc). Per the task
 * brief: businesses.ts hadn't been renamed to the Figma sample names yet
 * when this flow was built, so this literal demo business — taken straight
 * from the Figma screens — is used for the dedicated "found" trigger email,
 * while BUSINESSES-dataset emails are matched generically (see EnterEmail).
 */
export const FOUND_BUSINESS = {
  name: 'Bright Logistics Ltd',
  email: 'finance@brightlogistics.com',
  maskedEmail: 'f***@brightlogistics.com',
}

/** Real logo image asset (node 47040:225030 "Rectangle") — only ever used
 * for FOUND_BUSINESS, since it's the only business Figma gave real artwork
 * for. Every other matched business falls back to `BusinessAvatar` initials. */
function BusinessLogoAvatar({ size = 64 }: { size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#040609]"
      style={{ width: size, height: size }}
    >
      <img
        src={linkBusinessLogo}
        alt=""
        className="h-1/2 w-[41.67%] object-cover object-bottom"
      />
    </div>
  )
}

/**
 * Dimmed Home dashboard + full-viewport scrim behind the Link-existing-
 * business modal (Figma "Scrim" node, e.g. 46940:241904, sits over the
 * whole 1440×1226 canvas — sidebar, top bar and dashboard included).
 * Reuses the real Home page (which itself reuses AppShell/Sidebar/TopBar)
 * rather than re-implementing the dashboard chrome.
 */
export function LinkModalBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div className="pointer-events-none h-full w-full select-none opacity-60 blur-[1.5px]" aria-hidden>
        <Home />
      </div>
      <div className="fixed inset-0 z-40 bg-[rgba(8,13,20,0.55)]" />
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 sm:px-6">
        <div className="my-auto w-full" style={{ maxWidth: 560 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/** The gradient "status" banner shared by every Link-existing-business
 * modal state (e.g. node 47040:221850). `matched` swaps the second avatar
 * from a dashed empty-slot placeholder to the matched business's logo. */
function LinkModalBanner({ matched, onClose }: { matched: boolean; onClose: () => void }) {
  return (
    <div
      className="relative h-[318px] w-full shrink-0 overflow-hidden rounded-t-[31px]"
      style={{
        backgroundImage:
          'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(1,106,165) 18.5%, rgb(255,255,255) 78.6%)',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-6 top-6 h-8 w-8"
      >
        <img src={linkBannerClose} alt="" className="h-8 w-8" />
      </button>
      <div className="absolute left-1/2 top-[118px] h-[298px] w-[336px] -translate-x-1/2 rounded-t-[30px] bg-[#f3f3f3]" />
      <div className="absolute left-1/2 top-[137px] h-[328px] w-[370px] -translate-x-1/2 overflow-hidden rounded-t-[32px] bg-white">
        <div className="absolute left-[23px] top-[110px] h-[10px] w-[316px] rounded-full bg-[#efefef]" />
        <div className="absolute left-[23px] top-[127px] h-[10px] w-[225px] rounded-full bg-[#efefef]" />
        <div className="absolute left-[23px] top-[23px] flex h-16 items-start">
          <div className="relative z-[2] -mr-[22px] flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-solid border-white bg-black">
            <span
              className="font-heading text-[26px] font-semibold tracking-[-3.4px] text-white"
              style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}
            >
              acme
            </span>
          </div>
          {matched ? (
            <div className="relative z-[1] flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#040609]">
              <img src={linkBusinessLogo} alt="" className="h-1/2 w-[41.67%] object-cover object-bottom" />
            </div>
          ) : (
            <div className="relative z-[1] flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-[#c4c4c4] bg-[#eee]">
              <img src={linkBannerPlus} alt="" className="h-[10.67px] w-[10.67px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Persistent footer: "Not on Hinstantt yet? Add it" link + per-screen
 * button slot (e.g. node 47038:216164). Present, byte-for-byte identical,
 * on all 8 states. */
function LinkModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <Link to="/businesses/add" className="text-[13px] text-[#4b5563] hover:underline">
        Not on Hinstantt yet? <span className="font-semibold text-[#004b87]">Add it</span>
      </Link>
      <div className="flex items-start gap-2">{children}</div>
    </div>
  )
}

/** The white rounded modal card itself: banner + content + divider +
 * footer. Every Link-existing-business screen is one of these. */
export function LinkModalShell({
  matched,
  onClose,
  footer,
  children,
}: {
  matched: boolean
  onClose: () => void
  footer: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-stretch overflow-hidden rounded-[32px] bg-white shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]">
      <LinkModalBanner matched={matched} onClose={onClose} />
      <div className="flex flex-col items-center gap-5 px-6 pb-6 pt-1">{children}</div>
      <div className="h-px w-full bg-[#eff2f4]" />
      <LinkModalFooter>{footer}</LinkModalFooter>
    </div>
  )
}

/** Title + subtitle block shared by every state (node 47038:216138). */
export function LinkModalTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-1.5 text-center">
      <p className="font-heading text-2xl font-semibold text-[#111927]">{title}</p>
      <p className="mx-auto max-w-[400px] text-sm text-[#4b5563]">{subtitle}</p>
    </div>
  )
}

type ModalButtonVariant = 'primary' | 'secondary' | 'disabled'

/** Pill footer button for the Link-business modal — HDS Button, shape "pill" (Figma Button
 * "Rounded", node 45931:642912). `disabled` variant = HDS primary in its disabled state. */
export function ModalButton({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ModalButtonVariant; loading?: boolean }) {
  return (
    <HdsButton
      variant={variant === 'secondary' ? 'secondary' : 'primary'}
      shape="pill"
      // Keep the button readable while "Finding business..." spins (HDS loading state).
      disabled={variant === 'disabled' || disabled}
      loading={loading}
      className={className}
      {...rest}
    >
      {children}
    </HdsButton>
  )
}

/** The "Business email" input row (node 47038:216141 "Input fields"),
 * optionally in its red error state (node 47107:218223). */
export function EmailField({
  value,
  onChange,
  placeholder = 'name@company.com',
  disabled,
  error,
}: {
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
}) {
  return (
    <HdsInput
      label="Business email"
      type="email"
      value={value}
      disabled={disabled && !error}
      readOnly={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      error={error}
      containerClassName="w-full"
    />
  )
}

/** The gray "matched business" card shown on Found / Already-have-access /
 * Owner-connected / Pending-already (node 47040:225417 "Container"). Only
 * logo, name and masked email are shown — per the spec's "protect business
 * information" rule, nothing else (owner, team, balances, KYB status). */
export function BusinessMatchCard({
  name,
  maskedEmail,
  badge,
  initials,
  useLogo = false,
}: {
  name: string
  maskedEmail: string
  badge?: string
  initials?: string
  useLogo?: boolean
}) {
  return (
    <div className="flex w-full items-center justify-between rounded-xl bg-surface-2 py-4 pl-6 pr-3.5">
      <div className="flex items-center gap-5">
        {useLogo ? <BusinessLogoAvatar /> : <BusinessAvatar initials={initials ?? '?'} />}
        <div className="flex flex-col gap-1">
          <p className="font-heading text-xl font-semibold text-[#111927]">{name}</p>
          <p className="text-sm text-[#6c737f]">{maskedEmail}</p>
        </div>
      </div>
      {badge && (
        <HdsBadge color="navy" size="sm">
          {badge}
        </HdsBadge>
      )}
    </div>
  )
}

/** Pill status alert — green "success" (You already have access / Business
 * already connected) or amber "warning" (pending approval). Nodes
 * 47107:218610, 47107:218756, 47107:218904. */
export function LinkAlert({ tone, children }: { tone: 'success' | 'warning'; children: ReactNode }) {
  const toneStyles =
    tone === 'success'
      ? 'border-[#0e9e74] bg-[#e6f7f1] text-[#077155]'
      : 'border-[#8a6300] bg-[#fff3d6] text-[#8a6300]'
  return (
    <div
      className={`inline-flex w-fit items-center justify-center self-center rounded-full border-[0.5px] px-4 py-1 text-center text-sm font-semibold ${toneStyles}`}
    >
      {children}
    </div>
  )
}

/** Success toast shown on the Home dashboard after requesting access
 * (node 46940:236753 "Alert") — distinct from the modal flow: Figma shows
 * this as a floating toast over Home, not a modal state. */
export function LinkRequestSentToast({
  businessName,
  onClose,
}: {
  businessName: string
  onClose: () => void
}) {
  return (
    <div className="flex w-[400px] items-start gap-3 rounded-[10px] border-[0.5px] border-[#0e9e74] bg-[#e6f7f1] py-4 pl-4 pr-3.5">
      <img src={linkAlertSuccessCheck} alt="" className="h-[18px] w-[18px] shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm font-semibold text-[#077155]">Access request sent</p>
        <p className="text-xs text-[#555]">
          We've asked {businessName} to approve your request to link this business.
        </p>
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-65">
        <img src={linkAlertClose} alt="" className="h-4 w-4" />
      </button>
    </div>
  )
}
