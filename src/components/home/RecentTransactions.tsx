import txnPayout from '../../assets/icons/home-txn-payout.svg'
import txnConversion from '../../assets/icons/home-txn-conversion.svg'
import txnPayin from '../../assets/icons/home-txn-payin.svg'
import txnRefund from '../../assets/icons/home-txn-refund.svg'
import { Link } from 'react-router-dom'
import { HdsBadge, type BadgeColor } from '../ui/hds'

type TxnStatus = 'successful' | 'failed' | 'pending'

// Status → HDS Badge (798:7), Style=Text so the compact row layout is unchanged.
const statusColor: Record<TxnStatus, BadgeColor> = {
  successful: 'green',
  failed: 'red',
  pending: 'amber',
}

const transactions: {
  name: string
  meta: string
  amount: string
  status: TxnStatus
  statusLabel: string
  icon: string
  rotate?: boolean
  size: number
}[] = [
  {
    name: 'Matilda Smith',
    meta: 'Payout · Jan 6',
    amount: '-$13.25',
    status: 'successful',
    statusLabel: 'Successful',
    icon: txnPayout,
    size: 21.6,
  },
  {
    name: 'Jane Mueller',
    meta: 'Conversion · Jan 6',
    amount: '+£13.25',
    status: 'failed',
    statusLabel: 'Failed',
    icon: txnConversion,
    rotate: true,
    size: 21.6,
  },
  {
    name: 'Raj Kumar',
    meta: 'Payin · Jan 6',
    amount: '+€13.25',
    status: 'pending',
    statusLabel: 'Pending',
    icon: txnPayin,
    rotate: true,
    size: 19.35,
  },
  {
    name: 'Leo Aura',
    meta: 'Refund · Jan 31',
    amount: '+$13.25',
    status: 'successful',
    statusLabel: 'Successful',
    icon: txnRefund,
    rotate: true,
    size: 21.6,
  },
]

/** `empty`: a business that isn't active yet has no transactions (48029:228418). */
export default function RecentTransactions({ empty = false }: { empty?: boolean } = {}) {
  return (
    <div className="flex w-full flex-1 flex-col overflow-hidden rounded-xl border border-border-disabled bg-white pb-5">
      <div className="flex w-full items-center justify-between border-b border-border-disabled px-4 py-4">
        <p className="text-base font-semibold text-text-primary">Recent Transactions</p>
        {!empty && (
          <Link to="/transactions" className="text-[13px] font-semibold text-[#004b87] underline-offset-4 hover:underline">
            View all
          </Link>
        )}
      </div>
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <span className="flex size-[66px] items-center justify-center rounded-full bg-[#bfe9f7] text-[#111927]"><svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true"><path d="M6 2.75h12A1.25 1.25 0 0 1 19.25 4v17.1a.6.6 0 0 1-.93.5L16 20l-2.07 1.38a.6.6 0 0 1-.66 0L12 20.53l-1.27.85a.6.6 0 0 1-.66 0L8 20l-2.32 1.6a.6.6 0 0 1-.93-.5V4A1.25 1.25 0 0 1 6 2.75Zm3 5a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5H9Zm0 4a.75.75 0 0 0 0 1.5h4a.75.75 0 0 0 0-1.5H9Z" /></svg></span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold text-[#111927]">No transaction yet</p>
            <p className="mx-auto max-w-[260px] text-xs text-[#555354]">Your transactions will appear here once you start moving money.</p>
          </div>
        </div>
      ) : (
      <div className="flex w-full flex-col gap-1.5 px-5">
        {transactions.map((txn, i) => (
          <div
            key={txn.name}
            className={`flex w-full items-center gap-2.5 py-2.5 ${ i < transactions.length - 1 ? 'border-b border-[#f5f5f5]' : '' }`}
          >
            <img
              src={txn.icon}
              alt=""
              className={txn.rotate ? 'rotate-180' : ''}
              style={{ height: `${txn.size}px`, width: `${txn.size}px` }}
            />
            <div className="flex flex-1 flex-col gap-0.5">
              <p className="font-heading text-base font-medium tracking-[-0.08px] text-[#0e121b]">{txn.name}</p>
              <p className="text-[11px] text-[#555354]">{txn.meta}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-base font-semibold text-[#0e121b]">{txn.amount}</p>
              <HdsBadge color={statusColor[txn.status]} variant="text" size="sm" className="!h-auto">
                {txn.statusLabel}
              </HdsBadge>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
