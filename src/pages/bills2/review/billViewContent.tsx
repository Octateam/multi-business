import type { ComponentType, ReactNode } from 'react'
import Badge from '../../../components/ui/Badge'
import { longDate, money, type BillRecord } from '../list/billRecords'
import { BillViewCard } from './billViewShell'
import { FieldRow, TimelineRow } from './shared'

// ---------------------------------------------------------------------------
// The content of each "View bill" step, filled from ONE bill record. Shared by
// the single-bill stepper (Northwind* routes, `?bill=`) and the multi-bill
// review queue, so both always show the same data for a bill.
// ---------------------------------------------------------------------------

type CardComponent = ComponentType<{ title: string; children: ReactNode }>

/** Step 1 — Vendor info + Payment details (+ Contact details). Figma 45033:219739. */
export function VendorInfoCards({ bill, Card = BillViewCard, contact = false }: { bill: BillRecord; Card?: CardComponent; contact?: boolean }) {
  const v = bill.vendorInfo
  const p = bill.payment
  const payRows: [string, string][] = [
    ['Country', p.country],
    ['Payment method', p.method],
    ['Account name', p.accountName],
    ['Bank name', p.bank],
    ...p.codes,
    ['Account number', p.accountNumber],
    ['Account type', p.accountType],
    ['Address line 1', p.address],
    ...(p.state ? ([['State', p.state]] as [string, string][]) : []),
    ['City', p.city],
    ['Postal code', p.postalCode],
    ['Tax identification number', p.taxId],
  ]
  return (
    <>
      <Card title="Vendor info">
        <FieldRow label="Vendor type" value={v.type} />
        {v.type === 'Individual' && v.firstName ? (
          <>
            <FieldRow label="First name" value={v.firstName} />
            <FieldRow label="Last name" value={v.lastName ?? ''} />
          </>
        ) : (
          <FieldRow label="Business name" value={v.name} />
        )}
        <FieldRow label="Category" value={v.category} last />
      </Card>
      <Card title="Payment details">
        {payRows.map(([label, value], i) => (
          <FieldRow key={label} label={label} value={value} last={i === payRows.length - 1} />
        ))}
      </Card>
      {contact && (
        <Card title="Contact details">
          <FieldRow label="Email" value={bill.contact.email} />
          <FieldRow label="Phone" value={bill.contact.phone} />
          <FieldRow label="Address" value={bill.contact.address} last />
        </Card>
      )}
    </>
  )
}

/** Step 2 — Bill details, Bill breakdown and Total. Figma 45033:222571. */
export function BillDetailsContent({ bill, Card = BillViewCard }: { bill: BillRecord; Card?: CardComponent }) {
  const m = (n: number) => money(n, bill.symbol)
  const recurring = bill.billType === 'Recurring'
  const cycles = recurring ? billCycles(bill) : []
  return (
    <>
      <Card title="Bill details">
        <FieldRow label="Reference (invoice number)" value={bill.reference} />
        <FieldRow label="Currency" value={bill.currency} />
        <FieldRow label="Bill date" value={longDate(bill.billDate) || '—'} />
        <FieldRow label="Bill type" value={recurring ? 'Recurring' : 'One time'} />
        {recurring && (
          <>
            <FieldRow label="Bill frequency" value={bill.frequency} />
            <FieldRow label="Start date" value={longDate(bill.billDate) || '—'} />
            <FieldRow label="End date" value={cycles.length ? longDate(cycles[cycles.length - 1].due) : '—'} />
          </>
        )}
        <FieldRow label="Due date" value={longDate(bill.dueDate) || bill.dueDate || '—'} />
        <FieldRow label="Discount (optional)" value={bill.discount ? m(bill.discount) : '—'} />
        <FieldRow label="Tax (optional)" value={bill.tax ? m(bill.tax) : '—'} />
        <FieldRow label="Description" value={bill.description} last />
      </Card>

      <Card title="Bill breakdown">
        <div className="overflow-hidden rounded-lg" data-line-items>
          <div className="flex items-center bg-[#f8fafc] text-[11px] font-medium text-[#9aa1ac]">
            <div className="min-w-0 flex-[2] px-3.5 py-2.5">Item</div>
            <div className="w-[63px] px-1 py-2.5 text-right">Qty</div>
            <div className="flex-1 px-3 py-2.5 text-right">Unit price</div>
            <div className="flex-1 px-3 py-2.5 text-right">Amount</div>
          </div>
          {bill.items.map((line, i) => (
            <div key={i} className="flex items-center border-b border-[#eff2f4] text-[13px] last:border-b-0">
              <div className="min-w-0 flex-[2] px-3.5 py-3 text-text-primary">{line.item}</div>
              <div className="w-[63px] px-1 py-3 text-right text-text-primary">{line.qty.toLocaleString('en-US')}</div>
              <div className="flex-1 px-3 py-3 text-right text-text-primary">{m(line.unit)}</div>
              <div className="flex-1 px-3 py-3 text-right font-medium text-text-primary">{m(line.qty * line.unit)}</div>
            </div>
          ))}
        </div>
      </Card>

      {recurring && cycles.length > 0 && (
        <Card title="Bill cycle">
          <div className="overflow-hidden rounded-lg" data-bill-cycles>
            <div className="flex items-center bg-[#f8fafc] text-[11px] font-medium text-[#9aa1ac]">
              <div className="flex-1 px-3.5 py-2.5">Cycle</div>
              <div className="flex-1 px-3 py-2.5 text-center">Due date</div>
              <div className="flex-1 px-3 py-2.5 text-center">Date paid</div>
              <div className="flex-1 px-3 py-2.5 text-center">Status</div>
            </div>
            {cycles.map((c) => (
              <div key={c.n} className="flex items-center border-b border-[#eff2f4] text-[13px] last:border-b-0">
                <div className="flex-1 px-3.5 py-2.5 text-text-primary">Cycle {c.n}</div>
                <div className="flex-1 px-3 py-2.5 text-center text-text-primary">{c.due}</div>
                <div className="flex-1 px-3 py-2.5 text-center text-text-primary">{c.paid ?? '--'}</div>
                <div className="flex flex-1 justify-center px-3 py-2.5">
                  <Badge status={c.status === 'Paid' ? 'paid' : c.status === 'Overdue' ? 'pending' : 'info'} label={c.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Total">
        <div className="overflow-hidden rounded-lg border-[0.5px] border-[#f3f4f6]">
          <div className="flex flex-col gap-2 px-3.5 py-3">
            <div className="flex items-start justify-between text-[13px]">
              <p className="text-text-quaternary">Subtotal</p>
              <p className="font-semibold text-text-primary">{m(bill.subtotal)}</p>
            </div>
            <div className="flex items-start justify-between text-[13px]">
              <p className="text-text-quaternary">Discount</p>
              <p className={`font-semibold ${bill.discount ? 'text-[#b72020]' : 'text-text-primary'}`}>{bill.discount ? `-${m(bill.discount)}` : m(0)}</p>
            </div>
            <div className="flex items-start justify-between text-[13px]">
              <p className="text-text-quaternary">Tax</p>
              <p className="font-semibold text-text-primary">{bill.tax ? `+${m(bill.tax)}` : m(0)}</p>
            </div>
          </div>
          <div className="flex items-start justify-between bg-[#f0f9ff] px-3.5 py-3 text-sm">
            <p className="text-text-quaternary">Amount payable to vendor</p>
            <p className="font-medium text-text-primary" data-amount-payable>
              {m(bill.total)}
            </p>
          </div>
        </div>
      </Card>
    </>
  )
}

/** Cycles of a recurring bill (Figma 48121:449428 "Bill cycle"): earlier cycles paid, the current one in the
 * bill's state, the rest upcoming. Dates step by the bill's frequency from its bill date. */
function billCycles(bill: BillRecord) {
  const m = bill.billDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return []
  const start = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  const step = (d: Date, i: number) => {
    const x = new Date(d)
    const f = bill.frequency
    if (f === 'Daily') x.setDate(x.getDate() + i)
    else if (f === 'Weekly') x.setDate(x.getDate() + 7 * i)
    else if (f === 'Quarterly') x.setMonth(x.getMonth() + 3 * i)
    else if (f === 'Annually') x.setFullYear(x.getFullYear() + i)
    else x.setMonth(x.getMonth() + i)
    return x
  }
  const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
  const current = 4
  return Array.from({ length: 7 }, (_, i) => {
    const due = fmt(step(start, i))
    const n = i + 1
    const status: 'Paid' | 'Overdue' | 'Upcoming' =
      n < current || (n === current && bill.status === 'Paid') ? 'Paid' : n === current && bill.status === 'Overdue' ? 'Overdue' : 'Upcoming'
    return { n, due, paid: status === 'Paid' ? due : undefined, status }
  })
}

/** Step 3 — Approval details, workflow and activity for the bill's status (Figma 45033:222831 / 222325 / 223087). */
export function ApprovalContent({ bill, Card = BillViewCard }: { bill: BillRecord; Card?: CardComponent }) {
  const s = bill.status
  const p = bill.payment
  const approved = ['Payment pending', 'Paid', 'Payment failed'].includes(s)
  const adminApproved = s === 'Paid' || s === 'Payment pending'
  const created = bill.createdDate
  return (
    <>
      <Card title="Approval details">
        <FieldRow label="Bill amount" value={bill.amount} />
        <FieldRow label="Payee (Merchant/vendor)" value={bill.vendor} />
        <FieldRow label="Due date" value={longDate(bill.dueDate) || '—'} />
        <FieldRow label="Payment method" value={p.method} />
        <FieldRow label="Recipient bank" value={p.bank} />
        <FieldRow label="Account number" value={p.accountNumber} last={!p.codes.length} />
        {p.codes.map(([label, value], i) => (
          <FieldRow key={label} label={label} value={value} last={i === p.codes.length - 1} />
        ))}
      </Card>

      {s !== 'Draft' && s !== 'Needs action' && (
        <Card title="Approval workflow">
          <TimelineRow
            done={approved || s === 'Overdue'}
            title="Finance manager"
            subtitle="Any finance manager"
            date={approved || s === 'Overdue' ? created : 'Pending'}
            badge={approved || s === 'Overdue' ? <Badge status="approved" label="Approved" /> : undefined}
          />
          {s === 'Cancelled' ? (
            <TimelineRow variant="error" title="Admin" subtitle="Bill cancelled before approval" date="Cancelled" isLast />
          ) : adminApproved ? (
            <TimelineRow done title="Admin" subtitle="Required for bills above $5,000" date={created} badge={<Badge status="approved" label="Approved" />} isLast />
          ) : (
            <TimelineRow title="Admin" subtitle="Required for bills above $5,000" date="Pending" isLast />
          )}
        </Card>
      )}

      <Card title="Bill activity">
        <TimelineRow done title={s === 'Draft' ? 'Saved as draft' : 'Submitted by'} subtitle={bill.createdBy ?? 'John Doe'} date={created} />
        <TimelineRow done title="Document processed" subtitle="Invoice details extracted" date={created} isLast={s === 'Draft' || s === 'Needs action'} />
        {s === 'Pending approval' && (
          <TimelineRow title="Pending approval" subtitle="Waiting for approval from a finance manager." isLast />
        )}
        {s === 'Overdue' && (
          <TimelineRow variant="error" title="Overdue" subtitle={`Due ${longDate(bill.dueDate)} — still waiting for the admin approval.`} isLast />
        )}
        {s === 'Cancelled' && <TimelineRow variant="error" title="Cancelled" subtitle={bill.dueNote ?? 'Bill cancelled'} isLast />}
        {approved && (
          <>
            <TimelineRow done title="Approved" subtitle="John Doe" date={created} />
            {s === 'Payment failed' ? (
              <TimelineRow variant="error" title="Payment failed" subtitle="Not enough available balance in the source account. Retry 2 of 4 runs" isLast />
            ) : (
              <>
                <TimelineRow done={s === 'Paid'} title="Payment initiated" subtitle="Starts once the payment is made." />
                <TimelineRow done={s === 'Paid'} title="Paid" subtitle="Confirmed when the money reaches the account." isLast />
              </>
            )}
          </>
        )}
      </Card>

      {s === 'Needs action' && (
        <Card title="Requested information">
          <TimelineRow
            done
            title="Information requested"
            subtitle={<>Thomas Bennett: &ldquo;The invoice amount doesn&rsquo;t match the amount submitted. Please attach the corrected invoice.&rdquo;</>}
            date={created}
          />
          <TimelineRow done title="Information requested" subtitle={<>Thomas Bennett: &ldquo;The invoice is hard to read. Can you upload a clearer copy?&rdquo;</>} date={created} isLast />
        </Card>
      )}
    </>
  )
}
