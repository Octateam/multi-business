import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { money, setBillStatus, useBillRecord } from '../list/billRecords'
import { billViewPath } from '../list/billRoutes'
import AppShell from '../../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsSwitch, HdsTextarea, inputRowClass, type SelectOption } from '../../../components/ui/hds'
import {
  CURRENCY_OPTIONS,
  EXPENSE_CATEGORY_OPTIONS,
  KitAmountInput,
  KitDateInput,
  KitSelect,
  VENDOR_OPTIONS,
  vendorPaymentOptions,
} from '../hdsKit'
import chevronLeft from '../../../assets/icons/list3-chevron-left.svg'
import calendarIcon from '../../../assets/icons/list3-calendar-icon.svg'
import deleteHeaderIcon from '../../../assets/icons/list3-delete-02-header.svg'
import trashIcon from '../../../assets/icons/list3-trash-icon.svg'
import plusIcon from '../../../assets/icons/list3-plus-icon.svg'
import downloadIcon from '../../../assets/icons/list3-download-icon.svg'
import documentIcon from '../../../assets/icons/list3-document-icon.svg'
import invoicePreview from '../../../assets/img/list3-invoice-preview.png'

// Keep the Figma copy for the bill's currency ("Great British Pound").
const BILL_CURRENCY_OPTIONS: SelectOption[] = CURRENCY_OPTIONS.map((o) => (o.value === 'GBP' ? { ...o, label: 'GBP - Great British Pound' } : o))

// Discount / tax can be a percentage or a fixed amount in the bill currency.
const RATE_UNITS: SelectOption[] = [
  { value: '%', label: 'Percentage', meta: '%' },
  { value: 'fixed', label: 'Fixed amount', meta: '£' },
]

// Northwind's saved payout account as shown in Figma, then the vendor's other saved accounts.
const NORTHWIND_PAYMENT = 'GBP account · United Kingdom · Bank account · ••••4471'
const paymentOptionsFor = (vendor: string): SelectOption[] =>
  vendor === 'Northwind Design Ltd'
    ? [{ value: NORTHWIND_PAYMENT, label: NORTHWIND_PAYMENT, meta: 'Default' }, ...vendorPaymentOptions(vendor).slice(1)]
    : vendorPaymentOptions(vendor)

const CalendarImg = () => <img src={calendarIcon} alt="" className="h-[14px] w-[13px]" />

const ITEMS = [
  { item: 'Brand identity refresh — phase 2', qty: '1', unit: '£7,600', amount: '£7,600' },
  { item: 'Design system documentation', qty: '1', unit: '£1,600', amount: '£1,600' },
]

export default function EditBillNorthwindDesignLtdNw2481() {
  const navigate = useNavigate()
  // `?bill=<id>` (row "Edit bill" / a draft's row click) opens that bill; without it the Figma sample (NW-2481).
  const [params] = useSearchParams()
  const billId = params.get('bill')
  const record = useBillRecord(billId)
  const bill = billId ? record : null
  const sym = bill?.symbol ?? '£'
  const [scheduled, setScheduled] = useState(false)
  const [payee, setPayee] = useState(bill?.vendor ?? 'Northwind Design Ltd')
  const [payment, setPayment] = useState(bill && bill.vendor !== 'Northwind Design Ltd' ? (paymentOptionsFor(bill.vendor)[0]?.value ?? '') : NORTHWIND_PAYMENT)
  const [category, setCategory] = useState('Professional services')
  const [currency, setCurrency] = useState(bill ? bill.currency.slice(0, 3) : 'GBP')
  const [discountUnit, setDiscountUnit] = useState('%')
  const [taxUnit, setTaxUnit] = useState('%')
  const [form, setForm] = useState({
    reference: bill?.reference ?? 'NW-2481',
    billDate: bill?.billDate ?? '14/09/2026',
    dueDate: bill?.dueDate ?? '14/10/2026',
    discount: bill ? '0' : '2',
    tax: bill ? '0' : '5',
    description: bill?.description ?? 'Q3 brand identity refresh — phase 2',
  })
  const set = (key: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [key]: v }))
  const [items, setItems] = useState(() =>
    bill
      ? bill.items.map((it) => ({ item: it.item, qty: String(it.qty), unit: money(it.unit, sym), amount: money(it.qty * it.unit, sym) }))
      : ITEMS,
  )
  const updateItem = (i: number, patch: Partial<(typeof ITEMS)[number]>) =>
    setItems((list) => list.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  const toNum = (v: string) => Number(v.replace(/[^0-9.]/g, '')) || 0
  const totals = bill
    ? (() => {
        const sub = items.reduce((acc, it) => acc + toNum(it.qty) * toNum(it.unit), 0)
        const rate = (v: string, unit: string) => (unit === '%' ? (sub * toNum(v)) / 100 : toNum(v))
        return { sub, disc: rate(form.discount, discountUnit), tax: rate(form.tax, taxUnit) }
      })()
    : null
  const isValid =
    [payee, payment, category, currency, form.reference, form.billDate, form.dueDate, form.description].every((v) => v.trim() !== '') &&
    items.length > 0 &&
    items.every((it) => it.item.trim() !== '' && toNum(it.qty) > 0 && toNum(it.unit) > 0)

  return (
    <AppShell>
      <div className="flex w-full flex-col gap-6 bg-[#f8f8f8] py-7 pb-[90px]">
        <button
          type="button"
          className="flex w-fit items-center gap-2 rounded-full text-sm font-semibold text-text-primary hover:underline"
          onClick={() => navigate('/bills')}
        >
          <img src={chevronLeft} alt="" className="h-[9px] w-[5px]" />
          Bills
        </button>

        <div className="flex w-full items-center gap-4">
          <div className="flex flex-1 flex-col gap-3">
            <p className="font-heading text-2xl font-semibold text-text-primary">Edit bill</p>
            <p className="text-base text-[#4d5761]">
              Update the details and add items. You'll review and confirm on the next step.
            </p>
          </div>
          <HdsButton variant="secondary" onClick={() => navigate('/bills/list/bill-saved-as-draft-success-toast')}>
            Save as draft
          </HdsButton>
        </div>

        <div className="flex w-full items-start gap-4">
          {/* Left form card */}
          <div className="flex w-[691px] shrink-0 flex-col gap-6 rounded-xl border border-[#e3e8eb] bg-white px-4 py-5">
            <div className="flex w-full flex-col gap-4">
              <p className="text-base font-semibold text-text-primary">Vendor</p>
              <KitSelect
                label="Payee (Merchant/vendor)"
                placeholder="Search vendors"
                options={VENDOR_OPTIONS}
                value={payee}
                searchPlaceholder="Search vendors"
                onChange={(v) => {
                  setPayee(v)
                  setPayment(paymentOptionsFor(v)[0].value)
                }}
              />
              <KitSelect label="Payment details" placeholder="Select payment details" options={paymentOptionsFor(payee)} value={payment} onChange={setPayment} />
              <KitSelect label="Expense category" placeholder="Select category" options={EXPENSE_CATEGORY_OPTIONS} value={category} onChange={setCategory} searchPlaceholder="Search categories" />
            </div>

            <div className="flex w-full flex-col gap-4 border-y-[0.5px] border-[#d2d6db] py-4">
              <p className="text-base font-semibold text-text-primary">Bill details</p>
              <div className="flex w-full gap-3">
                <div className="w-[320px] shrink-0">
                  <HdsInput label="Reference (invoice number)" value={form.reference} placeholder="e.g 12345" onChange={(e) => set('reference')(e.target.value)} />
                </div>
                <div className="flex-1">
                  <KitSelect label="Currency" options={BILL_CURRENCY_OPTIONS} value={currency} onChange={setCurrency} searchPlaceholder="Search currencies" />
                </div>
              </div>
              <div className="flex w-full gap-3">
                <div className="flex-1">
                  <KitDateInput label="Bill date" value={form.billDate} onChange={set('billDate')} icon={<CalendarImg />} />
                </div>
                <div className="flex-1">
                  <KitDateInput label="Due date" value={form.dueDate} onChange={set('dueDate')} icon={<CalendarImg />} min={form.billDate} />
                </div>
              </div>
              <div className="flex w-full gap-3">
                <div className="flex-1">
                  <KitAmountInput
                    label="Discount"
                    optional
                    placeholder="0"
                    units={RATE_UNITS}
                    unit={discountUnit}
                    onUnitChange={setDiscountUnit}
                    value={form.discount}
                    onChange={set('discount')}
                  />
                </div>
                <div className="flex-1">
                  <KitAmountInput
                    label="Tax"
                    optional
                    placeholder="0"
                    units={RATE_UNITS}
                    unit={taxUnit}
                    onUnitChange={setTaxUnit}
                    value={form.tax}
                    onChange={set('tax')}
                  />
                </div>
              </div>
              <HdsTextarea
                label="Description"
                rows={3}
                maxChars={120}
                placeholder="Add a brief description (e.g. office rent, monthly subscription)"
                value={form.description}
                onChange={(e) => set('description')(e.target.value)}
              />
            </div>

            <div className="flex w-full flex-col gap-4 pt-4">
              <p className="text-base font-semibold text-text-primary">Bill breakdown</p>
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full items-center gap-3">
                  <p className="w-[297px] text-[11px] text-text-quaternary">Item</p>
                  <p className="w-[60px] text-right text-[11px] text-text-quaternary">Qty</p>
                  <p className="w-[100px] text-right text-[11px] text-text-quaternary">Unit price</p>
                  <p className="w-[100px] text-right text-[11px] text-text-quaternary">Amount</p>
                  <img src={deleteHeaderIcon} alt="" className="h-4 w-[15px]" />
                </div>
                {items.map((row, i) => (
                  <div key={i} className="flex w-full items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <HdsInput aria-label="Item" className="truncate" placeholder="Item name" value={row.item} onChange={(e) => updateItem(i, { item: e.target.value })} />
                    </div>
                    <div className="w-[60px] shrink-0">
                      <HdsInput aria-label="Quantity" inputMode="numeric" placeholder="0" value={row.qty} onChange={(e) => updateItem(i, { qty: e.target.value.replace(/[^0-9]/g, '') })} />
                    </div>
                    <div className="w-[100px] shrink-0">
                      <HdsInput aria-label="Unit price" inputMode="decimal" placeholder="0.00" value={row.unit} onChange={(e) => updateItem(i, { unit: e.target.value })} />
                    </div>
                    <div className={`${inputRowClass({ disabled: true })} h-11 w-[100px] shrink-0 !text-[#111927]`}>
                      <p className="truncate text-sm">{row.amount}</p>
                    </div>
                    <button
                      type="button"
                      className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#fde8ea]"
                      aria-label="Remove item"
                      onClick={() => setItems((list) => list.filter((_, idx) => idx !== i))}
                    >
                      <img src={trashIcon} alt="" className="h-[14px] w-[13px]" />
                    </button>
                  </div>
                ))}
                <HdsButton
                  variant="secondary"
                  size="sm"
                  shape="pill"
                  className="w-fit"
                  leadingIcon={<img src={plusIcon} alt="" className="h-3 w-3" />}
                  onClick={() => setItems((list) => [...list, { item: '', qty: '', unit: '', amount: '' }])}
                >
                  Add item
                </HdsButton>
              </div>

              <div className="flex w-full flex-col overflow-hidden rounded-lg border-[0.5px] border-[#f3f4f6]">
                <div className="flex w-full flex-col gap-2 px-3.5 py-3">
                  <div className="flex w-full items-center justify-between text-[11px]">
                    <p className="text-text-quaternary">Subtotal</p>
                    <p className="font-semibold text-text-primary">{totals ? money(totals.sub, sym) : '£9,200.00'}</p>
                  </div>
                  <div className="flex w-full items-center justify-between text-[11px]">
                    <p className="text-text-quaternary">Discount</p>
                    <p className="font-semibold text-text-primary">{totals ? `-${money(totals.disc, sym)}` : '-£184.00'}</p>
                  </div>
                  <div className="flex w-full items-center justify-between text-[11px]">
                    <p className="text-text-quaternary">Tax</p>
                    <p className="font-semibold text-text-primary">{totals ? `+${money(totals.tax, sym)}` : '+£460.00'}</p>
                  </div>
                </div>
                <div className="flex w-full items-center justify-between bg-[#f0f9ff] px-3.5 py-3 text-sm">
                  <p className="text-text-quaternary">Total</p>
                  <p className="font-semibold text-text-primary">{totals ? money(totals.sub - totals.disc + totals.tax, sym) : '£9,475.00'}</p>
                </div>
              </div>
            </div>

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <p className="text-sm font-medium text-text-primary">Schedule this bill</p>
                <p className="text-[11px] text-[#4b5563]">Set a recurring schedule for automatic or approved payments</p>
              </div>
              <HdsSwitch checked={scheduled} onChange={setScheduled} />
            </div>

            <div className="flex w-full flex-col gap-2.5">
              <HdsButton variant="primary" fullWidth disabled={!isValid} onClick={() => {
                if (bill) {
                  setBillStatus(bill.id, 'Pending approval')
                  navigate(billViewPath(1, { id: bill.id, status: 'Pending approval' }))
                } else navigate('/bills/review/northwind-design-ltd-vendor-info')
              }}>
                Submit for approval
              </HdsButton>
              <HdsButton variant="secondary" fullWidth onClick={() => navigate('/bills')}>
                Discard
              </HdsButton>
            </div>
          </div>

          {/* Right — upload panel */}
          <div className="flex w-[340px] shrink-0 flex-col gap-4 rounded-xl bg-white p-5">
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-text-primary">Invoice uploaded</p>
                  <p className="text-[11px] text-[#4b5563]">{bill?.invoiceFile ?? 'NW-2481.pdf'}</p>
                </div>
                <button type="button" className="flex size-9 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#fde8ea]" aria-label="Remove invoice">
                  <img src={trashIcon} alt="" className="h-[14px] w-[13px]" />
                </button>
              </div>
              <div className="h-[316px] w-full overflow-hidden rounded-lg border border-[#f3f4f6]">
                <img src={invoicePreview} alt="Invoice preview" className="h-full w-full object-cover" />
              </div>
            </div>

            <div className="flex w-full items-center gap-3">
              <div className="h-px flex-1 bg-border-disabled" />
              <p className="text-[13px] text-[#4d5761]">Or</p>
              <div className="h-px flex-1 bg-border-disabled" />
            </div>

            <div className="flex w-full flex-col gap-1.5">
              <p className="text-sm font-medium text-text-primary">Import bills</p>
              <div className="flex w-full items-center gap-3 rounded-xl border-[0.5px] border-[#edeff2] bg-surface-2 px-4 py-3.5">
                <img src={documentIcon} alt="" className="h-10 w-8" />
                <div className="flex flex-1 flex-col gap-1">
                  <p className="text-sm font-medium text-text-primary">Click to choose file</p>
                  <p className="text-[11px] text-[#4b5563]">CSV. XLSX · Max 10 MB</p>
                </div>
              </div>
              <HdsButton variant="link" className="w-fit text-sm" leadingIcon={<img src={downloadIcon} alt="" className="h-[11px] w-3" />}>
                Download template
              </HdsButton>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
