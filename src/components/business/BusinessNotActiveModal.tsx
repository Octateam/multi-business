import { useNavigate } from 'react-router-dom'
import notActiveCloseIcon from '../../assets/icons/switcher-modal-close.svg'
import notActiveWarningIcon from '../../assets/icons/switcher-warning-icon.svg'
import { HdsButton } from '../ui/hds'

/** Statuses where the business exists but still has to finish KYB — the user can enter it, but every
 * money-moving action is blocked behind this modal until KYB is complete. */
export const NEEDS_KYB_STATUSES = ['kyb-pending', 'action-required'] as const
export const needsKyb = (status: string) => (NEEDS_KYB_STATUSES as readonly string[]).includes(status)

// "Business not active yet" (Switcher 04 / Teams 48029:228653). "Complete KYB verification" takes the user
// into the KYB process for that business.
export default function BusinessNotActiveModal({ businessName, onClose }: { businessName: string; onClose: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,11,17,0.55)] px-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Business not active yet"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-[483px] max-w-full animate-[popIn_180ms_ease-out] flex-col overflow-hidden rounded-[31px]"
        style={{ backgroundImage: 'linear-gradient(180deg, rgb(0,0,0) 0%, rgb(253,116,52) 18.5%, rgb(255,255,255) 78%)' }}
      >
        <div className="relative h-[220px] shrink-0">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 size-8">
            <img src={notActiveCloseIcon} alt="" className="size-8" />
          </button>
          <div className="absolute left-1/2 top-[115px] flex size-[60px] -translate-x-1/2 items-center justify-center rounded-pill bg-white">
            <img src={notActiveWarningIcon} alt="" className="h-[26px] w-[28.67px]" />
          </div>
        </div>
        <div className="flex flex-col gap-8 bg-white p-8">
          <div className="flex flex-col gap-3">
            <p className="font-heading text-[32px] font-semibold tracking-tight text-text-primary">Business not active yet</p>
            <p className="text-base text-text-quaternary">{businessName} still needs to complete KYB verification before you can perform this action.</p>
          </div>
          <HdsButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => {
              onClose()
              navigate('/businesses/add/company')
            }}
          >
            Complete KYB verification
          </HdsButton>
        </div>
      </div>
    </div>
  )
}
