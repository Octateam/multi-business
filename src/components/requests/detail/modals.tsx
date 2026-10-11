import { useState } from 'react'
import { HdsButton, HdsTextarea } from '../../ui/hds'
import modalClose from '../../../assets/icons/reqdetail-modal-close.svg'
import modalWarning from '../../../assets/icons/reqdetail-modal-warning.svg'
import infoCircle from '../../../assets/icons/status2-info-circle.svg'
import { CloseButton, ModalShell } from './parts'

/*
 * Centred dialogs opened by the Request Detail actions.
 * - HeroConfirmModal: Figma 42563:369574 ("Cancel this request?" — orange hero, warning icon) and
 *   42563:372843 ("Approve reimbursement?" — blue hero, info icon, Reject / Approve).
 * - ReasonModal: Figma 43802:156311 ("Reject request?") and 37453:204318 ("Request more information").
 * - DocumentPreviewModal: Figma 43802:155853 (supporting document preview).
 */

const HERO = {
  warning: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(253,116,52) 18.5%, rgb(255,255,255) 78%)',
  info: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(1,106,165) 30%, rgb(255,255,255) 100%)',
}

export function HeroConfirmModal({
  tone,
  title,
  body,
  onClose,
  primary,
  secondary,
}: {
  tone: 'warning' | 'info'
  title: string
  body: string
  onClose: () => void
  primary: { label: string; onClick: () => void; destructive?: boolean }
  secondary?: { label: string; onClick: () => void }
}) {
  return (
    <ModalShell onClose={onClose} label={title}>
      <div className="flex w-full flex-col overflow-hidden rounded-[31px] bg-white">
        <div className="relative h-[220px] w-full" style={{ backgroundImage: HERO[tone] }}>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 size-8">
            <img src={modalClose} alt="" className="size-full" />
          </button>
          <span className="absolute left-1/2 top-[100px] flex size-[60px] -translate-x-1/2 items-center justify-center rounded-full bg-white">
            <img src={tone === 'warning' ? modalWarning : infoCircle} alt="" className="size-8" />
          </span>
        </div>
        <div className="flex w-full flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-3">
            <h2 className="font-heading text-[32px] font-semibold leading-10 tracking-[-0.64px] text-[#111927]">{title}</h2>
            <p className="text-base text-[#4b5563]">{body}</p>
          </div>
          <div className="flex gap-2">
            {secondary && (
              <HdsButton variant="secondary" size="lg" className="min-w-0 flex-1" onClick={secondary.onClick}>
                {secondary.label}
              </HdsButton>
            )}
            <HdsButton variant={primary.destructive ? 'destructive' : 'primary'} size="lg" className="min-w-0 flex-1" onClick={primary.onClick}>
              {primary.label}
            </HdsButton>
          </div>
        </div>
      </div>
    </ModalShell>
  )
}

export function ReasonModal({
  title,
  subtitle,
  fieldLabel,
  placeholder,
  initial = '',
  submitLabel,
  destructive,
  onClose,
  onSubmit,
}: {
  title: string
  subtitle: string
  fieldLabel: string
  placeholder: string
  initial?: string
  submitLabel: string
  destructive?: boolean
  onClose: () => void
  onSubmit: (text: string) => void
}) {
  const [text, setText] = useState(initial)
  const valid = text.trim().length > 0
  return (
    <ModalShell onClose={onClose} width={657} label={title}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (valid) onSubmit(text.trim())
        }}
        className="flex w-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0px_18px_48px_0px_rgba(10,46,61,0.16)]"
      >
        <div className="flex w-full items-start gap-4 px-[22px] pb-3.5 pt-5">
          <div className="flex flex-1 flex-col gap-1.5">
            <h2 className="font-heading text-[16.5px] font-semibold text-[#0c2129]">{title}</h2>
            <p className="text-sm text-[#5c6d77]">{subtitle}</p>
          </div>
          <CloseButton onClick={onClose} />
        </div>
        <div className="px-[22px] pb-5 pt-2">
          <HdsTextarea label={fieldLabel} value={text} maxChars={120} placeholder={placeholder} onChange={(e) => setText(e.target.value)} autoFocus rows={5} />
        </div>
        <div className="flex w-full items-center justify-end gap-2.5 border-t border-[#eff2f4] px-[22px] py-3.5">
          <HdsButton type="button" variant="secondary" size="sm" shape="pill" onClick={onClose}>
            Cancel
          </HdsButton>
          <HdsButton type="submit" variant={destructive ? 'destructive' : 'primary'} size="sm" shape="pill" disabled={!valid}>
            {submitLabel}
          </HdsButton>
        </div>
      </form>
    </ModalShell>
  )
}

export function DocumentPreviewModal({ filename, src, onClose }: { filename: string; src: string; onClose: () => void }) {
  return (
    <ModalShell onClose={onClose} width={657} label={filename}>
      <div className="flex w-full flex-col overflow-hidden rounded-[14px] bg-white">
        <div className="flex items-center gap-4 px-[22px] py-4">
          <p className="flex-1 truncate text-sm font-semibold text-[#111927]">{filename}</p>
          <CloseButton onClick={onClose} />
        </div>
        <div className="flex items-center justify-center bg-[#edeff2] px-6 py-6">
          <img src={src} alt={filename} className="max-h-[60vh] w-auto rounded-md shadow-md" />
        </div>
      </div>
    </ModalShell>
  )
}
