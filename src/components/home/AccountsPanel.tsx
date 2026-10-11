import { Link } from 'react-router-dom'
import flagEur from '../../assets/icons/home-flag-eur.svg'
import flagUsd from '../../assets/icons/home-flag-usd.svg'
import bankIcon from '../../assets/icons/home-bank-icon.svg'
import dotSeparator from '../../assets/icons/home-dot-separator.svg'
import caretRight from '../../assets/icons/home-caret-right.svg'
import marketingWallet from '../../assets/img/home-marketing-wallet.png'
import treasuryWallet from '../../assets/img/home-treasury-wallet.png'

type Account = {
  name: string
  ref: string
  currencySymbol?: string
  amount: string
  currencyLabel?: string
  icon: { type: 'flag' | 'photo'; src: string }
}

const accounts: Account[] = [
  {
    name: 'Operating account',
    ref: 'Checking •• 4367',
    currencySymbol: '€',
    amount: '2,150.67',
    icon: { type: 'flag', src: flagEur },
  },
  {
    name: 'Fees account',
    ref: 'Checking •• 8921',
    currencySymbol: '$',
    amount: '850.00',
    icon: { type: 'flag', src: flagUsd },
  },
  {
    name: 'Marketing wallet',
    ref: '0xA1b2 •• c3D4e5',
    amount: '3,200.50',
    currencyLabel: 'USDC',
    icon: { type: 'photo', src: marketingWallet },
  },
  {
    name: 'Treasury wallet',
    ref: '0xB2c3 •• d4E5f6',
    amount: '4,150.75',
    currencyLabel: 'USDT',
    icon: { type: 'photo', src: treasuryWallet },
  },
]

/** `onSetupProfile` + `empty`: a business that isn't active yet has no accounts (48029:228418). */
export default function AccountsPanel({ empty = false, onSetupProfile }: { empty?: boolean; onSetupProfile?: () => void } = {}) {
  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-xl border border-border-disabled bg-white pb-5">
      <div className="flex w-full items-center justify-between border-b border-[#f6f6f6] px-4 py-4">
        <p className="text-base font-semibold text-text-primary">My accounts</p>
        {empty ? (
          <button type="button" onClick={onSetupProfile} className="text-[13px] font-semibold text-[#004b87] underline-offset-4 hover:underline">
            Setup profile
          </button>
        ) : (
          <Link to="/accounts" className="text-[13px] font-semibold text-[#004b87] underline-offset-4 hover:underline">
            View all
          </Link>
        )}
      </div>
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <span className="flex size-[66px] items-center justify-center rounded-full bg-[#bfe9f7] text-[#111927]"><svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true"><path d="M11.4 2.4a1.2 1.2 0 0 1 1.2 0l7.9 4.6c.6.3.4 1.3-.3 1.3H3.8c-.7 0-.9-1-.3-1.3l7.9-4.6ZM5 10h2.5v7H5v-7Zm5.75 0h2.5v7h-2.5v-7ZM16.5 10H19v7h-2.5v-7ZM3.5 18.5h17a1 1 0 0 1 0 2h-17a1 1 0 0 1 0-2Z" /></svg></span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold text-[#111927]">Setup your banking profile</p>
            <p className="mx-auto max-w-[260px] text-xs text-[#555354]">Create dedicated currency accounts based on your business needs.</p>
          </div>
        </div>
      ) : (
      <div className="flex w-full flex-col px-5">
        {accounts.map((account, i) => (
          <Link
            key={account.name}
            to="/requests"
            className={`flex w-full items-center justify-between py-2.5 transition-colors hover:bg-surface-2 ${ i < accounts.length - 1 ? 'border-b border-[#f3f4f6]' : '' }`}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {account.icon.type === 'flag' ? (
                  <img src={account.icon.src} alt="" className="size-4" />
                ) : (
                  <img src={account.icon.src} alt="" className="size-4 rounded-full object-cover" />
                )}
                <p className="font-heading text-base font-medium tracking-[-0.08px] text-[#0e121b]">
                  {account.name}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <img src={bankIcon} alt="" className="size-3.5" />
                <p className="text-[11px] font-medium text-[#555354]">{account.ref.split(' •• ')[0]}</p>
                <img src={dotSeparator} alt="" className="h-1 w-3" />
                <p className="text-[11px] font-medium text-[#555354]">{account.ref.split(' •• ')[1]}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {account.currencySymbol && (
                <span className="text-sm font-medium text-[#4d5761]">{account.currencySymbol}</span>
              )}
              <span className="text-base font-semibold text-text-primary">{account.amount}</span>
              {account.currencyLabel && (
                <span className="text-sm font-medium text-[#4d5761]">{account.currencyLabel}</span>
              )}
              <img src={caretRight} alt="" className="ml-2 size-4" />
            </div>
          </Link>
        ))}
      </div>
      )}
    </div>
  )
}
