import { Drawer } from './ui'
import cancelSquare from '../../assets/icons/list1-close-square.svg'
import bankIcon from '../../assets/icons/sendmoney-bank.svg'
import globeIcon from '../../assets/icons/sendmoney-globe.svg'
import caretRight from '../../assets/icons/sendmoney-caret-right.svg'

// "Send money" chooser for currency (Sokin) accounts — Figma 48340:222536. Slides in from the right like every
// drawer. Domestic transfers are V1; international (SWIFT) transfers are a separate scope, kept as their own option.

export type SendKind = 'domestic' | 'international'

export default function SendMoneyDrawer({ open, currency, onClose, onPick }: { open: boolean; currency: string; onClose: () => void; onPick: (kind: SendKind) => void }) {
  const options: { kind: SendKind; icon: string; title: string; note: string }[] = [
    { kind: 'domestic', icon: bankIcon, title: 'Domestic transfer', note: `Send funds to a ${currency} bank account.` },
    { kind: 'international', icon: globeIcon, title: 'International transfer', note: 'Send funds to 40+ countries worldwide.' },
  ]
  return (
    <Drawer open={open} onClose={onClose}>
      <div className="flex flex-col gap-10 px-6 py-[42px]">
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-1.5">
            <h2 className="font-heading text-2xl font-semibold leading-8 text-[#1a1d23]" style={{ fontVariationSettings: '"opsz" 14, "wdth" 100' }}>
              Send money
            </h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <img src={cancelSquare} alt="" className="size-6" />
            </button>
          </div>
          <p className="text-sm leading-5 text-[#555354]">Choose how you want to send funds from your account.</p>
        </div>
        <div className="flex flex-col gap-4">
          {options.map((o) => (
            <button
              key={o.kind}
              type="button"
              onClick={() => onPick(o.kind)}
              className="flex h-[84px] w-full items-center gap-3 rounded-lg border border-[#d6d6d6] p-4 text-left transition-colors hover:border-[#9aa1ac] hover:bg-[#fafbfc]"
            >
              <span className="flex shrink-0 items-center rounded-full bg-[#f6f6f6] p-3">
                <img src={o.icon} alt="" className="size-4" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="text-sm font-medium leading-5 text-[#222121]">{o.title}</span>
                <span className="text-xs leading-4 text-[#555354]">{o.note}</span>
              </span>
              <img src={caretRight} alt="" className="size-4 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </Drawer>
  )
}
