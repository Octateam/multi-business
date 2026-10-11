import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import SubmitExpenseModal from '../../components/requests/SubmitExpenseModal'
import plusIcon from '../../assets/icons/dashboard-submit-expense-icon.svg'
import infoIcon from '../../assets/icons/list2-info-circle.svg'
import { HdsBadge, HdsButton, type BadgeColor } from '../../components/ui/hds'

type StatCard = {
  label: string
  value: string
  valueClass: string
  note: string
}

const STAT_CARDS: StatCard[] = [
  { label: 'Due this week', value: '$31,600', valueClass: 'text-text-primary', note: '3 bills · next 6 Aug' },
  { label: 'Overdue', value: '$8,730', valueClass: 'text-[#b4232e]', note: '3 bills past due' },
  { label: 'Awaiting approval', value: '$21,400', valueClass: 'text-[#8a6300]', note: '1 bill · 3 requests' },
  { label: 'Paid this month', value: '$86,420', valueClass: 'text-text-primary', note: '14 bills · 3 reimbursements' },
]

type NeedsAttentionRow = {
  item: string
  refId: string
  amount: string
  statusLabel: string
  statusColor: BadgeColor
  note: string
}

const NEEDS_ATTENTION_ROWS: NeedsAttentionRow[] = [
  {
    item: 'Figma Inc.',
    refId: 'REQ-2051',
    amount: '€6,100',
    statusLabel: 'Awaiting approval',
    statusColor: 'amber',
    note: 'Above the £5,000 threshold',
  },
  {
    item: 'Kairo Logistics BV',
    refId: 'REQ-1151',
    amount: '€2,100',
    statusLabel: 'Awaiting approval',
    statusColor: 'amber',
    note: 'Payout details changing',
  },
  {
    item: 'Kairo Logistics BV',
    refId: 'REQ-1151',
    amount: '€2,100',
    statusLabel: 'Payment failed',
    statusColor: 'red',
    note: 'Retry 3 of 4 on 5 Aug',
  },
  {
    item: 'Kairo Logistics BV',
    refId: 'REQ-1151',
    amount: '€2,100',
    statusLabel: 'Awaiting approval',
    statusColor: 'amber',
    note: 'Due in 7 days · new payout account',
  },
  {
    item: 'Kairo Logistics BV',
    refId: 'REQ-1151',
    amount: '€2,100',
    statusLabel: 'Needs review',
    statusColor: 'navy',
    note: 'Unknown sender · new vendor',
  },
]

const SPEND_CATEGORIES = [
  { label: 'Software', amount: 68700 },
  { label: 'Professional services', amount: 31200 },
  { label: 'Travel', amount: 22400 },
  { label: 'Marketing', amount: 18900 },
  { label: 'Others', amount: 4800 },
]

const UPCOMING_PAYMENTS = [
  { name: 'Ridgeline Cloud Inc', date: 'June 26, 2026', time: '9:35PM', amount: '$14,400' },
  { name: 'Northwind Design Ltd', date: 'June 26, 2026', time: '9:35PM', amount: '£1,700' },
  { name: 'Northwind Design Ltd', date: 'June 26, 2026', time: '9:35PM', amount: '£9,964' },
]

const TOP_VENDORS = [
  { name: 'Northwind Design Ltd', code: 'VND-00432', country: 'United Kingdom', amount: '$46,200', payments: '40 payments' },
  { name: 'Ridgeline Cloud Inc', code: 'VND-00218', country: 'United States', amount: '$31,500', payments: '31 payments' },
  { name: 'Meridian Legal Partners', code: 'VND-00507', country: 'Singapore', amount: '$46,200', payments: '16 payments' },
  { name: 'Kairo Logistics BV', code: 'VND-00611', country: 'Netherlands', amount: '$46,200', payments: '9 payments' },
]

function CardHead({ title, to }: { title: string; to: string }) {
  const navigate = useNavigate()
  return (
    <div className="flex w-full items-center justify-between border-b border-[#f3f4f6] pb-3">
      <p className="font-heading text-base font-medium tracking-[-0.08px] text-text-primary">{title}</p>
      <HdsButton variant="link" size="sm" onClick={() => navigate(to)}>
        View all
      </HdsButton>
    </div>
  )
}

export default function ExpensesOverview() {
  const navigate = useNavigate()
  const [showSubmitExpense, setShowSubmitExpense] = useState(false)
  const maxSpend = Math.max(...SPEND_CATEGORIES.map((c) => c.amount))

  return (
    <AppShell>
      <main className="flex w-full flex-col items-start gap-6 pb-10 pt-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Expenses</h1>
            <p className="font-heading text-base text-[#70707d]">
              Track vendors, requests, and bills, and see what needs your attention
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <HdsButton variant="secondary" onClick={() => navigate('/bills/add/manual-entry-empty')}>
              Create bill
            </HdsButton>
            <HdsButton
              variant="primary"
              onClick={() => setShowSubmitExpense(true)}
              leadingIcon={<img src={plusIcon} alt="" className="h-[11.67px] w-[11.67px]" />}
            >
              New request
            </HdsButton>
          </div>
        </div>

        <div className="flex w-full items-stretch gap-3">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="flex flex-1 flex-col gap-3 rounded-xl border border-[#e1e4e9] p-4">
              <div className="flex w-full items-center justify-between">
                <p className="text-sm font-medium text-text-primary">{card.label}</p>
                <img src={infoIcon} alt="" className="size-[18px]" />
              </div>
              <p className={`font-heading text-[32px] font-semibold tracking-[-0.64px] ${card.valueClass}`}>
                {card.value}
              </p>
              <p className="whitespace-nowrap text-[13px] text-[#9aa1ac]">{card.note}</p>
            </div>
          ))}
        </div>

        <div className="grid w-full grid-cols-2 gap-5">
          <div className="flex flex-col items-start gap-0 rounded-xl border border-[#edeff2] bg-white px-5 py-4">
            <CardHead title="Needs attention" to="/approvals" />
            <div className="flex w-full items-start bg-[#f8fafc] py-2.5">
              <p className="w-[190px] shrink-0 text-[10px] font-medium text-[#6b7280]">Item</p>
              <p className="w-[120px] shrink-0 text-[10px] font-medium text-[#6b7280]">Amount</p>
              <p className="flex-1 text-[10px] font-medium text-[#6b7280]">Status</p>
            </div>
            {NEEDS_ATTENTION_ROWS.map((row, index) => (
              <div
                key={`${row.refId}-${index}`}
                className={`flex w-full items-center py-2.5 ${ index < NEEDS_ATTENTION_ROWS.length - 1 ? 'border-b border-[#f3f4f6]' : '' }`}
              >
                <div className="flex w-[190px] shrink-0 flex-col justify-center">
                  <p className="text-xs font-medium text-[#1a1d23]">{row.item}</p>
                  <p className="text-xs text-[#1a1d23]">{row.refId}</p>
                </div>
                <p className="w-[120px] shrink-0 text-xs font-medium text-[#1a1d23]">{row.amount}</p>
                <div className="flex flex-1 flex-col items-start gap-1">
                  <HdsBadge color={row.statusColor} size="sm" dot>
                    {row.statusLabel}
                  </HdsBadge>
                  <p className="text-[10px] text-[#6c737f]">{row.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-start gap-3 rounded-xl border border-[#edeff2] bg-white px-5 py-4">
            <CardHead title="Upcoming payments" to="/bills" />
            <div className="flex w-full flex-col">
              {UPCOMING_PAYMENTS.map((payment, index) => (
                <div
                  key={`${payment.name}-${index}`}
                  className={`flex w-full items-center gap-3 py-3 ${ index < UPCOMING_PAYMENTS.length - 1 ? 'border-b border-[#edeff2]' : '' }`}
                >
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className="text-[13px] text-text-primary">{payment.name}</p>
                    <p className="text-[10px] tracking-[0.05px]">
                      <span className="text-[#111927]">{payment.date}</span>{' '}
                      <span className="text-[#6c737f]">{payment.time}</span>
                    </p>
                  </div>
                  <p className="text-[13px] text-text-primary">{payment.amount}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 rounded-xl border border-[#edeff2] bg-white px-5 py-4">
            <CardHead title="Spend by category" to="/expenses/budgets" />
            <div className="flex w-full flex-col gap-4">
              {SPEND_CATEGORIES.map((category) => (
                <div key={category.label} className="flex w-full flex-col gap-2">
                  <div className="flex w-full items-center justify-between text-sm">
                    <p className="text-[#4d5761]">{category.label}</p>
                    <p className="font-semibold text-text-primary">${category.amount.toLocaleString()}</p>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-[3px] bg-[#eaf2f9]">
                    <div
                      className="h-full rounded-[3px] bg-[#0c5c9c]"
                      style={{ width: `${Math.max((category.amount / maxSpend) * 100, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 rounded-xl border border-[#edeff2] bg-white px-5 py-4">
            <CardHead title="Top vendors" to="/vendors" />
            <div className="flex w-full flex-col">
              {TOP_VENDORS.map((vendor, index) => (
                <div
                  key={vendor.code}
                  className={`flex w-full items-center gap-3 pb-2 ${ index < TOP_VENDORS.length - 1 ? 'border-b border-[#f3f4f6]' : '' } ${index > 0 ? 'pt-4' : ''}`}
                >
                  <div className="flex flex-1 flex-col gap-1">
                    <p className="text-[13px] font-medium text-[#1a1d23]">{vendor.name}</p>
                    <p className="text-[10px] tracking-[0.05px] text-[#6c737f]">
                      {vendor.code} · {vendor.country}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold text-text-primary">{vendor.amount}</p>
                    <p className="text-[10px] tracking-[0.05px] text-[#6c737f]">{vendor.payments}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {showSubmitExpense && <SubmitExpenseModal onClose={() => setShowSubmitExpense(false)} />}
    </AppShell>
  )
}
