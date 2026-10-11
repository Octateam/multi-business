import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGoBack } from '../../../lib/navHistory'
import { money, useBillRecord } from './billRecords'
import { HdsBadge, type BadgeColor } from '../../../components/ui/hds'
import cancelSquare from '../../../assets/icons/list3-cancel-square.svg'
import bankIcon from '../../../assets/icons/list3-bank-icon.svg'
import userIcon from '../../../assets/icons/list3-user-icon.svg'
import clockIcon from '../../../assets/icons/list3-clock-icon.svg'
import timelineLine from '../../../assets/icons/list3-timeline-line.svg'

export type PaymentInfoStatus = 'paid' | 'payment-failed' | 'pending'

const STATUS_BADGE: Record<PaymentInfoStatus, { label: string; color: BadgeColor }> = {
  paid: { label: 'Paid', color: 'green' },
  'payment-failed': { label: 'Payment failed', color: 'red' },
  pending: { label: 'Pending', color: 'amber' },
}

type ActivityEntry = { title: string; sub: string; time: string; dot: 'green' | 'red' | 'grey' }

const ACTIVITY: Record<PaymentInfoStatus, ActivityEntry[]> = {
  paid: [
    { title: 'Payment completed', sub: 'Payment successful', time: 'Aug 15, 2026, 10:24 AM', dot: 'green' },
    { title: 'Payment initiated', sub: 'Harriet Underwood', time: 'Aug 15, 2026, 10:18 AM', dot: 'green' },
    { title: 'Bill approved', sub: 'Tessa Olsen', time: 'Aug 15, 2026, 10:18 AM', dot: 'green' },
  ],
  'payment-failed': [
    { title: 'Payment failed', sub: 'Payment unsuccessful', time: 'Aug 15, 2026, 10:24 AM', dot: 'red' },
    { title: 'Payment initiated', sub: 'Harriet Underwood', time: 'Aug 15, 2026, 10:18 AM', dot: 'green' },
    { title: 'Bill approved', sub: 'Tessa Olsen', time: 'Aug 15, 2026, 10:18 AM', dot: 'green' },
  ],
  pending: [
    { title: 'Payment completed', sub: 'Payment successful', time: 'Pending', dot: 'grey' },
    { title: 'Payment initiated', sub: 'Harriet Underwood', time: 'Pending', dot: 'grey' },
    { title: 'Bill approved', sub: 'Tessa Olsen', time: 'Aug 15, 2026, 10:24 AM', dot: 'green' },
  ],
}

const dotClass: Record<ActivityEntry['dot'], string> = {
  green: 'border-[#12883e] bg-[#12883e]',
  red: 'border-[#d92836] bg-[#d92836]',
  grey: 'border-[#9da4ae] bg-[#9da4ae]',
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start gap-4">
      <p className="w-[160px] shrink-0 text-[13px] text-text-quaternary">{label}</p>
      <p className="flex-1 text-sm text-text-primary">{value}</p>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-4 rounded-xl border border-[#e3e8ef] bg-white p-5">{children}</div>
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3">
        <img src={icon} alt="" className="h-[14px] w-[14px]" />
      </div>
      <p className="text-base font-semibold text-text-primary">{title}</p>
    </div>
  )
}

export default function PaymentInformationSideSheet({ status }: { status: PaymentInfoStatus }) {
  const close = useGoBack('/bills')
  const [params] = useSearchParams()
  const bill = useBillRecord(params.get('bill') ?? 'aws-8834')
  const amount = money(bill.total, bill.symbol)
  const debited = money(bill.total + 2, bill.symbol)
  const p = bill.payment
  const badge = STATUS_BADGE[status]
  const activity = ACTIVITY[status]

  return (
    <div className="relative flex h-full w-full">
      {/* Dimmed Bills list background */}
      <div className="flex-1 overflow-hidden py-7">
        <p className="font-heading text-2xl font-semibold text-text-primary">Bills</p>
        <p className="mt-1 text-sm text-text-quaternary">Review, approve, and pay what you owe vendors.</p>
      </div>
      <button
        aria-label="Close payment information"
        className="fixed inset-0 cursor-default bg-black/40"
        onClick={close}
      />

      {/* Side sheet */}
      <div className="fixed bottom-10 right-10 top-10 flex w-[560px] flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full items-center justify-between">
            <p className="font-heading text-2xl font-semibold text-text-primary">Payment information</p>
            <button type="button" onClick={close} aria-label="Close">
              <img src={cancelSquare} alt="" className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-text-quaternary">Bill payment summary for #{bill.reference}</p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <Card>
            <HdsBadge color={badge.color}>{badge.label}</HdsBadge>
            <div className="flex items-center gap-4">
              <p className="w-[160px] shrink-0 text-[13px] text-text-quaternary">{status === 'paid' ? 'Amount paid' : 'Amount'}</p>
              <p className="font-heading text-2xl font-semibold text-text-primary">{amount}</p>
            </div>
            <FieldRow label="Payment date" value={status === 'pending' ? `Scheduled · ${bill.dueBy ?? bill.dueDate ?? '—'}` : 'Aug 15, 2026, 10:24 AM'} />
            <FieldRow label="Payment method" value={p.method} />
            <FieldRow label="Fee" value="$2.00" />
            <FieldRow label="Payment ID" value="PAY-008421" />
            <FieldRow label="Reference" value={bill.reference} />
            <FieldRow label="Description" value={`${bill.vendor} – Invoice ${bill.reference}`} />
          </Card>

          <Card>
            <CardHeader icon={bankIcon} title="Paid from" />
            <FieldRow label="Account" value="USD Account •••• 7821" />
            <FieldRow label="Account name" value="Acme Trading Co." />
            <FieldRow label="Account type" value="Business checking" />
            <FieldRow label="Bank" value="Lead Bank" />
            <FieldRow label="Amount debited" value={debited} />
          </Card>

          <Card>
            <CardHeader icon={userIcon} title="Paid to" />
            <FieldRow label="Vendor" value={bill.vendor} />
            <FieldRow label="Account name" value={p.accountName} />
            <FieldRow label="Bank" value={p.bank} />
            <FieldRow label="Account number" value={p.accountNumber} />
            {p.codes.map(([label, value]) => (
              <FieldRow key={label} label={label} value={value} />
            ))}
            <FieldRow label="Country" value={p.country} />
            <FieldRow label="Vendor address" value={bill.contact.address} />
          </Card>

          <Card>
            <CardHeader icon={clockIcon} title="Payment activity" />
            <div className="relative flex w-full flex-col gap-4">
              <div className="absolute bottom-[2px] left-[6px] top-[2px] w-px">
                <img src={timelineLine} alt="" className="h-full w-px" />
              </div>
              {activity.map((entry) => (
                <div key={entry.title} className="flex w-full items-start gap-3">
                  <div className="flex size-[13px] shrink-0 items-center justify-center bg-white">
                    <div className={`size-[11px] rounded-md border-[2.5px] ${dotClass[entry.dot]}`} />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <p className={`text-[13px] font-medium ${entry.time === 'Pending' ? 'text-[#9aa1ac]' : 'text-text-primary'}`}>
                      {entry.title}
                    </p>
                    <p className="text-[11px] text-[#4d5761]">{entry.sub}</p>
                  </div>
                  <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">{entry.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
