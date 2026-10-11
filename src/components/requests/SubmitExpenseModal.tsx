import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HdsBadge } from '../ui/hds'
import { CloseButton } from './detail/parts'
import moneyIcon from '../../assets/icons/submit-expense-money-03.svg'
import reimbursementIcon from '../../assets/icons/submit-expense-reimbursement.svg'
import cartIcon from '../../assets/icons/submit-expense-cart.svg'
import travelIcon from '../../assets/icons/submit-expense-travel.svg'
import caretRight from '../../assets/icons/submit-expense-caret-right.svg'

const SLIDE_MS = 300

type ExpenseOption = {
  key: string
  title: string
  description: string
  icon: string
  iconClass: string
  to?: string
}

// Copy, icons and icon geometry from Figma node 47401:540383 ("Submit expense" drawer).
const OPTIONS: ExpenseOption[] = [
  {
    key: 'vendor',
    title: 'Pay a vendor',
    description: "Get approval to pay a supplier's invoice.",
    icon: moneyIcon,
    iconClass: 'h-[15.42px] w-[17.92px]',
    to: '/pay-vendor',
  },
  {
    key: 'reimbursement',
    title: 'Claim a reimbursement',
    description: 'Get reimbursed for a business expense.',
    icon: reimbursementIcon,
    iconClass: 'size-[17.08px]',
    to: '/claim-reimbursement',
  },
  {
    key: 'purchase',
    title: 'Purchase',
    description: 'Request approval for a business purchase.',
    icon: cartIcon,
    iconClass: 'size-[18.33px]',
  },
  {
    key: 'travel',
    title: 'Travel',
    description: 'Get approval before booking',
    icon: travelIcon,
    iconClass: 'h-[14.58px] w-[17.92px]',
  },
]

export default function SubmitExpenseModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  // Mount off-screen, then flip on the next frame so the transform transition actually runs.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const close = () => {
    setOpen(false)
    window.setTimeout(onClose, SLIDE_MS)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        window.setTimeout(onClose, SLIDE_MS)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className={`absolute inset-0 bg-[#111927]/50 transition-opacity duration-300 ease-out motion-reduce:transition-none ${ open ? 'opacity-100' : 'opacity-0' }`}
        onClick={close}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Submit expense"
        className={`relative my-10 mr-10 flex w-[513px] max-w-[calc(100%-80px)] flex-col rounded-2xl gap-6 overflow-y-auto bg-white px-6 py-8 shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none ${ open ? 'translate-x-0' : 'translate-x-[calc(100%+40px)]' }`}
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Submit expense</h2>
            <CloseButton onClick={close} />
          </div>
          <p className="text-sm text-[#555354]">Choose what you need approval for.</p>
        </div>

        <div className="flex flex-col gap-4">
          {OPTIONS.map((option) => {
            const comingSoon = !option.to
            return (
              <button
                key={option.key}
                type="button"
                disabled={comingSoon}
                onClick={() => option.to && navigate(option.to)}
                className={`flex h-[84px] w-full items-center gap-3 rounded-lg border border-[#d6d6d6] p-4 text-left transition-colors ${ comingSoon ? 'cursor-not-allowed opacity-50' : 'hover:border-[#111927] hover:bg-[#fafafa]' }`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#f6f6f6]">
                  <img src={option.icon} alt="" className={option.iconClass} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-sm font-medium text-[#222121]">{option.title}</span>
                  <span className="text-xs text-[#555354]">{option.description}</span>
                </span>
                {comingSoon ? (
                  <HdsBadge color="grey" className="shrink-0">
                    Coming soon
                  </HdsBadge>
                ) : (
                  <img src={caretRight} alt="" className="size-4 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
