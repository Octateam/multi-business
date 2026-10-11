import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../../../components/layout/AppShell'
import Button from '../../../components/ui/Button'
import { HdsButton, HdsInput } from '../../../components/ui/hds'
import { CURRENCY_CODE_OPTIONS, KitDateInput, KitSelect } from '../hdsKit'
import { Card, EditPillButton, ReviewFooter, ReviewHeader, ReviewQueuePanel, ReviewStepper, TimelineRow, type QueueItem } from './shared'

const QUEUE_ITEMS: QueueItem[] = [
  { name: 'Joleen Freeman', amount: '$10,488.00', badges: [{ label: 'Pending approval', status: 'pending' }] },
  { name: 'Northwind Design Ltd', amount: '$9,200.00', badges: [{ label: 'Payment failed', status: 'payment-failed' }] },
  { name: 'Meridian Legal Partners', amount: '$4,800.00', badges: [{ label: 'Overdue', status: 'rejected' }] },
  { name: 'Northstar Labs', amount: '$4,800.00', badges: [{ label: 'Payment pending', status: 'pending' }] },
]

// Line-item cells — HDS input row tokens (44px, bg #f5f6f8, 0.5px #edeff2, focus 1px #004b87).
const CELL =
  'h-11 min-w-0 rounded-lg border-[0.5px] border-[#edeff2] bg-[#f5f6f8] px-2.5 text-sm text-[#111927] outline-none transition-colors placeholder:text-[#9aa1ac] hover:border-[#e1e4e9] hover:bg-[#edeff2] focus:border focus:border-[#004b87] focus:bg-[#f5f6f8]'

const formatGbp = (n: number) => `£${n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function BillDetailsApprovalQueueEditable() {
  const navigate = useNavigate()
  const [fields, setFields] = useState({
    reference: 'NW-2481',
    currency: 'GBP',
    billDate: '14 September 2026',
    dueDate: '14 October 2026',
    description: 'Office printing and supplies',
  })
  const field = (key: keyof typeof fields) => ({
    value: fields[key],
    onChange: (v: string) => setFields((f) => ({ ...f, [key]: v })),
  })
  const [items, setItems] = useState([
    { name: 'Brand identity refresh — phase 2', qty: '1', price: '£7,600.00' },
    { name: 'Design system documentation', qty: '1', price: '£1,600.00' },
  ])
  const updateItem = (i: number, key: 'name' | 'qty' | 'price', v: string) =>
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, [key]: v } : it)))
  const toNum = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0
  const isValid =
    Object.values(fields).every((v) => v.trim() !== '') &&
    items.every((it) => it.name.trim() !== '' && toNum(it.qty) > 0 && toNum(it.price) > 0)

  return (
    <AppShell>
      <div className="flex h-full w-full flex-col">
        <ReviewHeader
          subtitle="Look over the details and take action"
          actions={
            <>
              <Button variant="secondary">Request information</Button>
              <Button variant="primary" disabled={!isValid}>
                Review &amp; approve
              </Button>
            </>
          }
        />
        <ReviewStepper active={2} />
        <div className="flex flex-1 items-start justify-center gap-6 overflow-auto py-8">
          <ReviewQueuePanel items={QUEUE_ITEMS} />

          <div className="flex w-[459px] max-w-full shrink-0 flex-col gap-6">
            <Card title="Bill details">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <HdsInput
                    label="Reference (invoice number)"
                    containerClassName="min-w-0 flex-1"
                    value={fields.reference}
                    onChange={(e) => field('reference').onChange(e.target.value)}
                  />
                  <KitSelect
                    label="Currency"
                    className="min-w-0 flex-1"
                    options={CURRENCY_CODE_OPTIONS}
                    searchPlaceholder="Search currency"
                    {...field('currency')}
                  />
                </div>
                <div className="flex gap-3">
                  <KitDateInput label="Bill date" className="min-w-0 flex-1" {...field('billDate')} />
                  <KitDateInput label="Due date" className="min-w-0 flex-1" {...field('dueDate')} min={fields.billDate} />
                </div>
                <HdsInput
                  label="Description"
                  value={fields.description}
                  onChange={(e) => field('description').onChange(e.target.value)}
                />
              </div>
            </Card>

            <Card title="Bill breakdown">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 text-xs font-medium text-text-quaternary">
                  <p className="flex-[2]">Item</p>
                  <p className="flex-1 text-right">Qty</p>
                  <p className="flex-1 text-right">Unit price</p>
                  <p className="flex-1 text-right">Amount</p>
                </div>
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      aria-label="Item"
                      placeholder="Item name"
                      value={it.name}
                      onChange={(e) => updateItem(i, 'name', e.target.value)}
                      className={`flex-[2] ${CELL}`}
                    />
                    <input
                      aria-label="Qty"
                      inputMode="numeric"
                      placeholder="0"
                      value={it.qty}
                      onChange={(e) => updateItem(i, 'qty', e.target.value)}
                      className={`w-14 text-right ${CELL}`}
                    />
                    <input
                      aria-label="Unit price"
                      inputMode="decimal"
                      placeholder="£0.00"
                      value={it.price}
                      onChange={(e) => updateItem(i, 'price', e.target.value)}
                      className={`flex-1 text-right ${CELL}`}
                    />
                    <p className="w-20 text-right text-sm font-medium text-text-primary">{formatGbp(toNum(it.qty) * toNum(it.price))}</p>
                  </div>
                ))}
                <HdsButton
                  variant="secondary"
                  size="sm"
                  className="w-fit"
                  onClick={() => setItems((list) => [...list, { name: '', qty: '1', price: '' }])}
                >
                  + Add item
                </HdsButton>

                <div className="flex flex-col gap-2 border-t border-[#e5e7eb] pt-3">
                  <div className="flex justify-between text-sm">
                    <p className="text-text-quaternary">Subtotal</p>
                    <p className="font-medium text-text-primary">£9,200.00</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-text-quaternary">Discount (2%)</p>
                    <p className="font-medium text-text-primary">-£184.00</p>
                  </div>
                  <div className="flex justify-between text-sm">
                    <p className="text-text-quaternary">Tax (5%)</p>
                    <p className="font-medium text-text-primary">£460.00</p>
                  </div>
                  <div className="flex justify-between border-t border-[#e5e7eb] pt-2">
                    <p className="text-sm font-semibold text-text-primary">Total</p>
                    <p className="text-sm font-semibold text-text-primary">£9,475.00</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex w-[272px] shrink-0 flex-col gap-4">
            <Card title="Approval workflow" action={<EditPillButton>Edit</EditPillButton>}>
              <TimelineRow title="Finance manager" subtitle="Any finance manager" date="28 Jul 2026" />
              <TimelineRow title="Admin" subtitle="Required for bills above £5,000" date="Pending" isLast />
            </Card>
          </div>
        </div>
        <ReviewFooter>
          <Button
            variant="secondary"
            onClick={() => navigate('/bills/review/vendor-info-payment-details')}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            disabled={!isValid}
            onClick={() => navigate('/bills/review/approval-details-read-only-awaiting-approval')}
          >
            Next
          </Button>
        </ReviewFooter>
      </div>
    </AppShell>
  )
}
