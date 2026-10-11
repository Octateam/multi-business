import { useState } from 'react'
import { Drawer } from '../accounts/ui'
import { HdsButton, HdsInput, HdsSelect, type SelectOption } from '../../components/ui/hds'
import { KitPhoneInput, dialFor } from '../bills2/hdsKit'
import { useBusinessContext } from '../../context/BusinessContext'
import successIllustration from '../../assets/icons/accounts-success-illustration.svg'
import iconBackArrow from '../../assets/icons/vendors-icon-back-arrow.svg'
import type { PendingInviteRow } from './shared'

// "Invite team member" (Figma 48029:232162): one drawer, three steps.
//   Form — personal details + one or more business accesses (business, role, view role permissions,
//          "Add new access", "delete access") → Review invite (disabled until everything is filled in)
//   Review — personal information + business access (one card per business when there are several) → Send invite
//   Sent — "Invite sent" with who was invited to which business as which role → Done

type Permissions = { level: string; lines: string[] }

// Role permissions as defined in the Sprint 5 role notes (35349:514945, 36390:311969, 36390:312001).
export const INVITE_ROLES: (SelectOption & { permissions: Permissions })[] = [
  { value: 'Admin', label: 'Admin', permissions: { level: 'Full Access', lines: ['Admin has full access to all platform functionalities without any restrictions'] } },
  {
    value: 'Finance Manager',
    label: 'Finance Manager',
    permissions: {
      level: 'Moderated Access',
      lines: [
        'Can initiate transfers, FX exchanges, and manage payment recipients',
        'Can view and export account statements and transaction records',
        'Can view and fund cards but cannot create or terminate them',
        'No access to invite or manage team members',
        'No access to create accounts or manage linked accounts',
        'Cannot delete authorization rules',
      ],
    },
  },
  {
    value: 'Operations Manager',
    label: 'Operations Manager',
    permissions: {
      level: 'Moderated Access',
      lines: [
        'Can create, fund, and freeze corporate cards',
        'Can view transaction history and manage payment recipients',
        'Can add and view team members but cannot remove or deactivate them',
        'Cannot initiate transfers or FX exchanges',
        'No access to account funding or export',
        'No access to authorization rules management',
      ],
    },
  },
]

type Access = { business: string | null; role: string | null }
export type InviteDraft = { name: string; email: string; iso: string; phone: string; access: Access[] }

const EMPTY: InviteDraft = { name: '', email: '', iso: 'US', phone: '', access: [{ business: null, role: null }] }
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
const article = (role: string) => (/^[aeiou]/i.test(role) ? 'an' : 'a')
const lowerRole = (role: string) => role.toLowerCase()

const SectionLabel = ({ children }: { children: string }) => <p className="text-[11px] font-medium uppercase tracking-wide text-[#6b7280]">{children}</p>

const NoteGlyph = () => (
  <svg viewBox="0 0 16 16" className="mt-px size-3.5 shrink-0" fill="none" aria-hidden="true">
    <path d="M3 2.5h7.5L13 5v8.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" fill="#111927" />
    <path d="M10.5 2.5V5H13" stroke="#f5f6f8" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)

function PermissionsNote({ role }: { role: string }) {
  const p = INVITE_ROLES.find((r) => r.value === role)?.permissions
  if (!p) return null
  return (
    <div className="flex animate-[fadeIn_160ms_ease-out] flex-col gap-2.5 rounded-xl bg-[#edeff2] p-4">
      <p className="text-xs font-semibold text-[#4b5563]">{p.level}</p>
      <ul className="flex flex-col gap-2">
        {p.lines.map((l) => (
          <li key={l} className="flex items-start gap-2 text-xs leading-4 text-[#4b5563]">
            <NoteGlyph />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} aria-label="Close" className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-[#9aa1ac] text-white transition-colors hover:bg-[#6b7280]">
    <svg viewBox="0 0 12 12" className="size-2.5" aria-hidden="true">
      <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  </button>
)

function AccessBlock({
  access,
  businessOptions,
  onChange,
  onDelete,
}: {
  access: Access
  businessOptions: SelectOption[]
  onChange: (next: Access) => void
  onDelete?: () => void
}) {
  const [showPermissions, setShowPermissions] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <HdsSelect label="Business" placeholder="Select" options={businessOptions} value={access.business} onChange={(v) => onChange({ ...access, business: v })} />
      <div className="flex flex-col gap-2">
        <HdsSelect label="Role" placeholder="Select" options={INVITE_ROLES} value={access.role} onChange={(v) => onChange({ ...access, role: v })} />
        {access.role && (
          <button type="button" onClick={() => setShowPermissions((s) => !s)} aria-expanded={showPermissions} className="flex w-fit items-center gap-1.5 text-xs font-medium text-[#111927] hover:underline">
            View {lowerRole(access.role)} permissions
            <svg viewBox="0 0 10 6" className={`h-1.5 w-2.5 transition-transform ${showPermissions ? 'rotate-180' : ''}`} aria-hidden="true">
              <path d="M0 0h10L5 6z" fill="currentColor" />
            </svg>
          </button>
        )}
        {access.role && showPermissions && <PermissionsNote role={access.role} />}
      </div>
      {onDelete && (
        <button type="button" onClick={onDelete} className="flex items-center gap-1 self-end rounded-full bg-[#fde8ea] px-2 py-0.5 text-[11px] font-medium text-[#b4232e] hover:bg-[#fbd5d9]">
          <svg viewBox="0 0 16 16" className="size-3" fill="currentColor" aria-hidden="true">
            <path d="M6 1.75h4a.75.75 0 0 1 .75.75V3.5h2.5a.75.75 0 0 1 0 1.5H12.6l-.6 8.2A1.75 1.75 0 0 1 10.26 15H5.74A1.75 1.75 0 0 1 4 13.2L3.4 5h-.65a.75.75 0 0 1 0-1.5h2.5V2.5A.75.75 0 0 1 6 1.75Zm.75 1.75h2.5V3.25h-2.5V3.5Z" />
          </svg>
          delete access
        </button>
      )}
    </div>
  )
}

const ReviewRow = ({ label, value, last }: { label: string; value: string; last?: boolean }) => (
  <div className={`flex items-center justify-between gap-4 py-2 ${last ? '' : 'border-b border-[#eff2f4]'}`}>
    <p className="text-[13px] text-[#4d5761]">{label}</p>
    <p className="text-right text-[13px] font-medium text-[#111927]">{value}</p>
  </div>
)

export default function InviteMemberDrawer({
  open,
  initialDraft,
  initialStep = 'form',
  onClose,
  onSent,
}: {
  open: boolean
  initialDraft?: InviteDraft
  initialStep?: 'form' | 'review'
  onClose: () => void
  /** Called on Done with the invite that was sent. */
  onSent: (invite: PendingInviteRow) => void
}) {
  const { businesses } = useBusinessContext()
  const [step, setStep] = useState<'form' | 'review' | 'sent'>(initialStep)
  const [draft, setDraft] = useState<InviteDraft>(initialDraft ?? EMPTY)
  const set = (patch: Partial<InviteDraft>) => setDraft((d) => ({ ...d, ...patch }))

  // Businesses the inviter owns (requests awaiting someone else's approval can't be shared).
  const owned = businesses.filter((b) => b.status !== 'pending-approval')
  const optionsFor = (i: number): SelectOption[] =>
    owned.filter((b) => b.name === draft.access[i].business || !draft.access.some((a, j) => j !== i && a.business === b.name)).map((b) => ({ value: b.name, label: b.name }))

  const accessComplete = draft.access.every((a) => a.business && a.role)
  const complete = Boolean(draft.name.trim() && isEmail(draft.email) && draft.phone.replace(/\D/g, '').length >= 7 && accessComplete)
  const canAddAccess = accessComplete && draft.access.length < owned.length
  const grants = draft.access.filter((a): a is { business: string; role: string } => Boolean(a.business && a.role))
  const phone = `${dialFor(draft.iso)} ${draft.phone.trim()}`

  const sentMessage =
    grants.length === 1
      ? `to join your team, ${grants[0].business} as ${article(grants[0].role)} ${grants[0].role}`
      : `to join your teams, ${grants
          .map((g) => `${g.business} as ${article(g.role)} ${g.role}`)
          .join(', ')
          .replace(/, ([^,]*)$/, ' and $1')}`

  const done = () => {
    onSent({
      id: `invite-${Date.now()}`,
      name: draft.name.trim(),
      email: draft.email.trim(),
      phone,
      invitedOn: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      invitedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', ''),
      businessAccess: grants.map((g) => ({ businessName: g.business, role: g.role })),
    })
  }

  return (
    <Drawer open={open} onClose={step === 'sent' ? done : onClose}>
      {step === 'form' && (
        <div key="form" className="flex min-h-full animate-[fadeIn_200ms_ease-out] flex-col">
          <div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Invite team members</h2>
                <p className="text-sm text-[#555354]">They&rsquo;ll get an email invite to set up their account</p>
              </div>
              <CloseButton onClick={onClose} />
            </div>

            <div className="flex flex-col gap-4">
              <SectionLabel>Personal details</SectionLabel>
              <HdsInput label="Full name" placeholder="Enter full name" value={draft.name} onChange={(e) => set({ name: e.target.value })} />
              <HdsInput label="Email address" type="email" placeholder="Enter address" value={draft.email} onChange={(e) => set({ email: e.target.value })} />
              <KitPhoneInput label="Phone number" iso={draft.iso} onIsoChange={(iso) => set({ iso })} number={draft.phone} onChange={(v) => set({ phone: v })} placeholder="(000) 000-0000" />
            </div>

            <div className="flex flex-col gap-4">
              <SectionLabel>Business information</SectionLabel>
              {draft.access.map((a, i) => (
                <div key={i} className={i > 0 ? 'animate-[fadeIn_200ms_ease-out] border-t border-[#edeff2] pt-4' : ''}>
                  <AccessBlock
                    access={a}
                    businessOptions={optionsFor(i)}
                    onChange={(next) => set({ access: draft.access.map((x, j) => (j === i ? next : x)) })}
                    onDelete={i > 0 ? () => set({ access: draft.access.filter((_, j) => j !== i) }) : undefined}
                  />
                </div>
              ))}
              {canAddAccess && (
                <div className="border-t border-[#edeff2] pt-4">
                  <button type="button" onClick={() => set({ access: [...draft.access, { business: null, role: null }] })} className="flex items-center gap-2 text-sm font-semibold text-[#004b87] hover:underline">
                    <span className="text-lg leading-none">+</span>
                    Add new access
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3">
            <HdsButton variant="primary" fullWidth disabled={!complete} onClick={() => setStep('review')}>
              Review invite
            </HdsButton>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div key="review" className="flex min-h-full animate-[fadeIn_200ms_ease-out] flex-col">
          <div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-8">
            <button type="button" onClick={() => setStep('form')} className="flex w-fit items-center gap-1 text-[#555354] hover:text-[#111927]">
              <img src={iconBackArrow} alt="" className="h-3 w-3" />
              <span className="text-xs font-medium">Back</span>
            </button>
            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Review invite</h2>
              <p className="text-sm text-[#555354]">Make sure all information below is accurate.</p>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#111927]">Personal information</p>
              <div className="flex flex-col">
                <ReviewRow label="Full name" value={draft.name.trim()} />
                <ReviewRow label="Email" value={draft.email.trim()} />
                <ReviewRow label="Phone number" value={phone} last />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-[#111927]">Business access</p>
              {grants.length === 1 ? (
                <div className="flex flex-col">
                  <ReviewRow label="Business name" value={grants[0].business} />
                  <ReviewRow label="Role" value={grants[0].role} last />
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {grants.map((g, i) => (
                    <div key={g.business} className="flex flex-col rounded-xl bg-[#f5f6f8] px-4 pb-2 pt-3">
                      <p className="border-b border-[#e1e4e9] pb-2 text-[11px] font-semibold text-[#111927]">Business {i + 1}</p>
                      <ReviewRow label="Business name" value={g.business} />
                      <ReviewRow label="Role" value={g.role} last />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="sticky bottom-0 bg-white px-6 pb-6 pt-3">
            <HdsButton variant="primary" fullWidth onClick={() => setStep('sent')}>
              Send invite
            </HdsButton>
          </div>
        </div>
      )}

      {step === 'sent' && (
        <div key="sent" className="relative flex min-h-full animate-[fadeIn_250ms_ease-out] items-center justify-center px-6 py-16">
          <div className="absolute right-6 top-6">
            <CloseButton onClick={done} />
          </div>
          <div className="flex w-full max-w-[400px] flex-col items-center gap-8 text-center">
            <img src={successIllustration} alt="" className="h-40 w-[193px] animate-[popIn_400ms_ease-out]" />
            <div className="flex flex-col gap-2">
              <p className="font-heading text-[22px] font-semibold text-[#222121]">Invite sent</p>
              <p className="text-sm leading-5 text-[#555354]">
                You have sent an invite to <span className="font-semibold text-[#111927]">{draft.email.trim()}</span> {sentMessage}.
              </p>
            </div>
            <HdsButton variant="primary" fullWidth onClick={done}>
              Done
            </HdsButton>
          </div>
        </div>
      )}
    </Drawer>
  )
}
