import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import backArrow from '../../../assets/icons/status1-back-arrow.svg'
import chevronDown from '../../../assets/icons/status1-chevron-down.svg'
import receiptImage from '../../../assets/img/reqdetail-receipt-image.png'
import invoiceImage from '../../../assets/img/review1-receipt-preview.png'
import successCheck from '../../../assets/icons/list1-toast-success-check.svg'
import errorAlert from '../../../assets/icons/list1-toast-error-alert.svg'
import toastClose from '../../../assets/icons/list1-toast-close.svg'

/*
 * Building blocks of the Request Detail screens (Figma "06 — Request Detail — …" frames in the
 * Requests section 37453:197545): breadcrumb, name + badges + actions header, the Expense /
 * Beneficiary / Payout summary / Activity card, the receipt card, plus the overlay shells the
 * detail actions open (centred modal, right-hand drawer, toast).
 */

export function Breadcrumb({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-2 rounded-full text-sm font-semibold text-[#111927] hover:text-[#004b87]">
      <img src={backArrow} alt="" className="h-[9px] w-[5px]" />
      Requests
    </button>
  )
}

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-6 overflow-hidden rounded-xl border border-[#e3e8eb] bg-white px-[22px] py-5">
      {children}
    </div>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-start gap-2">
      <h2 className="w-full pb-2 text-base font-semibold text-[#111927]">{title}</h2>
      {children}
    </section>
  )
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex w-full items-start gap-3.5 border-b border-[#eff2f4] py-2">
      <p className="shrink-0 text-sm text-[#6b7280]">{label}</p>
      <p className="flex-1 text-right text-[13px] font-semibold text-[#111927]">{value}</p>
    </div>
  )
}

export function BeneficiaryRow({ initials, name, meta, open, onToggle }: { initials: string; name: string; meta: string; open: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-2.5 border-b border-[#e3e8eb] py-3 text-left">
      <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-[#1d4f63] text-[11px] font-semibold text-white">{initials}</span>
      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-[#111927]">{name}</span>
        <span className="text-[11px] text-[#4d5761]">{meta}</span>
      </span>
      <img src={chevronDown} alt="" className={`h-[5px] w-[9px] shrink-0 transition-transform ${open ? '' : '-rotate-90'}`} />
    </button>
  )
}

export function PayoutSummary({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-[#cbd0d8] bg-[#f5f6f8] px-3.5 py-3">
      {rows.map((row) => (
        <div key={row.label} className="flex w-full items-start gap-2 text-[12.5px]">
          <p className="flex-1 text-[#6b7280]">{row.label}</p>
          <p className="shrink-0 font-semibold text-[#111927]">{row.value}</p>
        </div>
      ))}
    </div>
  )
}

export type TimelineDot = 'success' | 'error' | 'muted' | 'disabled'

export type TimelineItem = { label: string; sublabel?: ReactNode; date?: string; dot: TimelineDot }

const DOT: Record<TimelineDot, string> = {
  success: 'bg-[#12883e]',
  error: 'bg-[#b72020]',
  muted: 'bg-[#4d5761]',
  disabled: 'bg-[#9da4ae]',
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative flex w-full flex-col gap-3.5">
      {items.length > 1 && <span aria-hidden className="absolute bottom-3 left-[6px] top-3 w-px bg-[#d2d6db]" />}
      {items.map((item, i) => {
        const muted = item.dot === 'disabled'
        return (
          <li key={i} className="relative flex w-full items-start gap-3">
            <span className="flex size-[13px] shrink-0 items-center justify-center pt-1">
              <span className={`size-[11px] rounded-full ring-2 ring-white ${DOT[item.dot]}`} />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className={`text-[13px] font-medium ${muted ? 'text-[#9aa1ac]' : 'text-[#111927]'}`}>{item.label}</p>
              {item.sublabel && <p className={`text-xs ${muted ? 'text-[#9da4ae]' : 'text-[#6b7280]'}`}>{item.sublabel}</p>}
            </div>
            {item.date && <p className="shrink-0 whitespace-nowrap text-[10px] font-medium tracking-[0.05px] text-[#9aa1ac]">{item.date}</p>}
          </li>
        )
      })}
    </ol>
  )
}

export function ReceiptPanel({ filename, kind, onView }: { filename: string; kind: 'receipt' | 'invoice'; onView: () => void }) {
  return (
    <div className="flex w-[340px] shrink-0 flex-col items-center gap-4 rounded-xl bg-white px-4 py-5">
      <div className="flex w-full flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-[#111927]">{kind === 'invoice' ? 'Invoice uploaded' : 'Receipt uploaded'}</p>
          <p className="text-[11px] text-[#4b5563]">{filename}</p>
        </div>
        <button type="button" onClick={onView} className="aspect-[274/360] w-full overflow-hidden rounded-lg border border-[#e1e4e9]">
          <img src={kind === 'invoice' ? invoiceImage : receiptImage} alt={kind === 'invoice' ? 'Invoice' : 'Receipt'} className={`size-full ${kind === 'invoice' ? 'bg-white object-contain' : 'object-cover'}`} />
        </button>
      </div>
      <button type="button" onClick={onView} className="text-sm font-semibold text-[#004b87] hover:underline underline-offset-4">
        {kind === 'invoice' ? 'View invoice' : 'View receipt'}
      </button>
    </div>
  )
}

export const receiptPreviewSrc = (kind: 'receipt' | 'invoice') => (kind === 'invoice' ? invoiceImage : receiptImage)

function useEscape(onClose: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
}

/** Full-screen dark overlay + centred dialog. */
export function ModalShell({ onClose, children, width = 483, label }: { onClose: () => void; children: ReactNode; width?: number; label: string }) {
  useEscape(onClose)
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 animate-[fadeIn_160ms_ease-out] bg-[#111927]/50" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={label} className="relative max-h-full animate-[popIn_180ms_ease-out] overflow-y-auto" style={{ width, maxWidth: '100%' }}>
        {children}
      </div>
    </div>,
    document.body,
  )
}

/** Right-hand drawer: 16px radius, inset 40px from the viewport edges, full-screen dark overlay. */
export function DrawerShell({ onClose, children, width = 465, label }: { onClose: () => void; children: ReactNode; width?: number; label: string }) {
  useEscape(onClose)
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-[fadeIn_160ms_ease-out] bg-[#111927]/50" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute bottom-10 right-10 top-10 flex max-w-[calc(100vw-80px)] animate-[rise_220ms_ease-out] flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl"
        style={{ width }}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function CloseButton({ onClick, label = 'Close' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#cbd0d8] text-[#111927] hover:bg-[#9aa1ac]">
      <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden="true">
        <path d="m4 4 8 8m0-8-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </button>
  )
}

export type ToastData = { tone: 'success' | 'error'; title: string; message?: string }

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(t)
  }, [toast, onClose])
  const success = toast.tone === 'success'
  return createPortal(
    <div
      role="status"
      className={`fixed right-10 top-[88px] z-[70] flex w-[400px] animate-[popIn_180ms_ease-out] items-start gap-3 rounded-[10px] border-[0.5px] py-4 pl-4 pr-3.5 shadow-sm ${ success ? 'border-[#0e9e74] bg-[#e6f7f1]' : 'border-[#d92836] bg-[#fde8ea]' }`}
    >
      <img src={success ? successCheck : errorAlert} alt="" className="mt-0.5 size-4 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className={`text-sm font-semibold ${success ? 'text-[#077155]' : 'text-[#b4232e]'}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-[#4b5563]">{toast.message}</p>}
      </div>
      <button type="button" aria-label="Dismiss" onClick={onClose} className="shrink-0 opacity-65 hover:opacity-100">
        <img src={toastClose} alt="" className="size-2.5" />
      </button>
    </div>,
    document.body,
  )
}

export function UploadDropzone({ file, onFile, label = 'Click to upload or drag and drop' }: { file: string | null; onFile: (name: string | null) => void; label?: string }) {
  if (file) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#eaf2f9] text-[#004b87]">
          <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
            <path d="M9 1.5H4.5A1.5 1.5 0 0 0 3 3v10a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 13 13V5.5L9 1.5Z" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9 1.5v4h4" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate text-sm font-medium text-[#111927]">{file}</p>
          <p className="text-[11px] text-[#6b7280]">Uploaded</p>
        </div>
        <button type="button" onClick={() => onFile(null)} className="text-sm font-semibold text-[#b4232e] hover:underline underline-offset-4">
          Remove
        </button>
      </div>
    )
  }
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const f = e.dataTransfer.files?.[0]
        if (f) onFile(f.name)
      }}
      className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#cbd0d8] bg-[#f5f6f8] px-4 py-6 text-center transition-colors hover:border-[#004b87] hover:bg-[#eaf2f9]"
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-[#d1e3f3] text-[#004b87]">
        <svg viewBox="0 0 16 16" className="size-4" fill="none" aria-hidden="true">
          <path d="M8 10.5V2.5m0 0L5 5.5m3-3 3 3M3 10v2.5A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm font-medium text-[#111927]">{label}</span>
      <span className="text-[11px] text-[#6b7280]">PDF, JPG, PNG (up to 10MB)</span>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f.name)
        }}
      />
    </label>
  )
}
