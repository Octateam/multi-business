import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsSelect, HdsTextarea, type SelectOption } from '../../components/ui/hds'
import calendarIcon from '../../assets/icons/claim-manual-calendar.svg'
import plusIcon from '../../assets/icons/claim-manual-plus.svg'
import fileIcon from '../../assets/icons/claim-manual-file.svg'
import cancelIcon from '../../assets/icons/claim-manual-cancel.svg'
import { BackLink, ManualEntryShell, peekPendingNewAccount, setPendingNewAccount } from './shared'
import { useGoBack } from '../../lib/navHistory'
import { CURRENCIES, CurrencyAmountField, FlagImg, currencyByCode } from './CurrencyAmountField'

const DEFAULT_ACCOUNTS = [
  'Priya Raman · Access Bank · 0123456789 · NGN',
  'Priya Raman · Revolut Bank · DE890123456789 · EUR',
  'Northwind Studios Ltd. · Chase Bank · DE890123456789 · EUR',
]

// Designed category options (Figma) — kept exactly.
const CATEGORIES = ['Meals and entertainment', 'Travel', 'Professional services', 'Software', 'Office supplies']
const CATEGORY_OPTIONS: SelectOption[] = CATEGORIES.map((c) => ({ value: c, label: c }))

const accountCurrency = (account: string) => account.split(' · ').pop() ?? 'USD'

const money = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type ClaimDraft = {
  accounts: string[]
  selectedAccount: string
  payee: string
  datePaid: string
  dueDate: string
  amount: string
  tax: string
  currency: string
  category: string
  description: string
}

const CalendarGlyph = () => <img src={calendarIcon} alt="" className="h-[17.5px] w-[16.25px]" />

// Figma node 43258:163880 ("sweep function" under "Claim a reimbursement — filled", x=460,
// y=6627) — the manual-entry form, pre-filled with the Figma "filled" state values.
export default function ManualEntryForm() {
  const navigate = useNavigate()
  const location = useLocation() as { pathname: string; state?: { newAccount?: string; draft?: ClaimDraft } | null }
  const goBack = useGoBack('/claim-reimbursement')
  // What the user entered is kept on this history entry before Add account opens, so coming back
  // (Close, or after adding the account) restores every field.
  const draft = location.state?.draft
  const [accounts, setAccounts] = useState(draft?.accounts ?? DEFAULT_ACCOUNTS)
  const [selectedAccount, setSelectedAccount] = useState(draft?.selectedAccount ?? DEFAULT_ACCOUNTS[0])
  const [payee, setPayee] = useState(draft?.payee ?? 'Lisboa Trattoria')
  const [datePaid, setDatePaid] = useState(draft?.datePaid ?? '28/07/2026')
  const [dueDate, setDueDate] = useState(draft?.dueDate ?? '28/07/2026')
  const [amount, setAmount] = useState(draft?.amount ?? '120.00')
  const [tax, setTax] = useState(draft?.tax ?? '14.40')
  const [currency, setCurrency] = useState(draft?.currency ?? 'EUR')
  const [category, setCategory] = useState(draft?.category ?? 'Meals and entertainment')
  const [description, setDescription] = useState(draft?.description ?? '')
  const openAddAccount = () => {
    const current: ClaimDraft = { accounts, selectedAccount, payee, datePaid, dueDate, amount, tax, currency, category, description }
    navigate(location.pathname, { replace: true, state: { draft: current } })
    navigate('/claim-reimbursement/manual-entry/add-account', { state: { fromForm: true } })
  }

  const isValid = Boolean(
    payee.trim() &&
      datePaid.trim() &&
      dueDate.trim() &&
      Number(amount.replace(/,/g, '')) > 0 &&
      tax.trim() &&
      category &&
      description.trim() &&
      selectedAccount,
  )

  const newAccount = location.state?.newAccount ?? peekPendingNewAccount() ?? undefined

  const accountOptions: SelectOption[] = accounts.map((account) => {
    const code = accountCurrency(account)
    const known = CURRENCIES.find((c) => c.code === code)
    return { value: account, label: account, icon: known ? <FlagImg src={known.flag} /> : undefined }
  })

  // Payout summary follows the claim currency and the selected beneficiary account's currency.
  const fromCur = currencyByCode(currency)
  const toCur = currencyByCode(accountCurrency(selectedAccount))
  const amountValue = Number(amount.replace(/,/g, '')) || 0
  const rate = fromCur.usdRate / toCur.usdRate
  const rateLabel = rate >= 1 ? money(rate) : rate.toLocaleString('en-US', { maximumSignificantDigits: 4 })

  useEffect(() => {
    if (!newAccount) return
    setAccounts((prev) => (prev.includes(newAccount) ? prev : [newAccount, ...prev]))
    setSelectedAccount(newAccount)
    setPendingNewAccount(null)
    navigate(location.pathname, { replace: true, state: {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAccount])

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex w-full flex-col gap-6">
          <BackLink onClick={goBack} />

          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">
              Claim a reimbursement
            </h1>
            <p className="text-sm text-[#555354]">
              Provide the required expense information for review and approval
            </p>
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5">
              <p className="text-base font-semibold text-text-primary">Expense details</p>
            </div>

            <HdsInput label="Payee (merchant or vendor)" value={payee} onChange={(e) => setPayee(e.target.value)} placeholder="Enter payee name" />

            <div className="flex w-full gap-2">
              <HdsInput
                containerClassName="min-w-0 flex-1"
                label="Date paid"
                value={datePaid}
                onChange={(e) => setDatePaid(e.target.value)}
                placeholder="DD/MM/YYYY"
                trailingIcon={<CalendarGlyph />}
              />
              <HdsInput
                containerClassName="min-w-0 flex-1"
                label="Due date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="DD/MM/YYYY"
                trailingIcon={<CalendarGlyph />}
              />
            </div>

            <div className="flex w-full gap-2">
              <div className="min-w-0 flex-1">
                <CurrencyAmountField
                  label="Amount (excluding tax)"
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  amount={amount}
                  onAmountChange={setAmount}
                />
              </div>
              <div className="min-w-0 flex-1">
                <CurrencyAmountField
                  label="Tax (from receipt)"
                  display="symbol"
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  amount={tax}
                  onAmountChange={setTax}
                />
              </div>
            </div>

            <HdsSelect
              label="Category"
              placeholder="Select category"
              options={CATEGORY_OPTIONS}
              value={category || null}
              onChange={setCategory}
            />

            <HdsTextarea
              label="Description"
              value={description}
              maxChars={120}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add the requested details or explain the update you've made"
            />
          </div>

          <div className="flex w-full flex-col gap-4">
            <div className="flex w-full items-center justify-between border-b border-[#eff2f4] pb-2.5">
              <p className="text-base font-semibold text-text-primary">Beneficiary details</p>
              <HdsButton
                variant="link"
                leadingIcon={<img src={plusIcon} alt="" className="size-4" />}
                onClick={openAddAccount}
              >
                Add account
              </HdsButton>
            </div>

            <HdsSelect
              label="Account"
              placeholder="Select account"
              options={accountOptions}
              value={selectedAccount}
              onChange={setSelectedAccount}
              searchPlaceholder="Search accounts"
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <p className="w-full border-b border-[#eff2f4] pb-2 text-base font-semibold text-text-primary">
              Payout summary
            </p>
            <div className="flex w-full flex-col gap-2 rounded-lg border border-[#cbd0d8] bg-surface-2 px-3.5 py-3 text-[12.5px]">
              {[
                ['Amount', `${fromCur.symbol}${money(amountValue)}`],
                ['Fees', `${fromCur.symbol}${money(10)}`],
                ['Estimated payout', `${toCur.symbol}${money(amountValue * rate)}`],
                ['Exchange rate (indicative)', `1 ${fromCur.code} = ${rateLabel} ${toCur.code}`],
              ].map(([label, value]) => (
                <div key={label} className="flex w-full items-start justify-between">
                  <p className="text-[#6b7280]">{label}</p>
                  <p className="font-semibold text-text-primary">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <p className="text-sm font-medium text-[#111927]">
              Receipt <span className="font-normal text-[#6b7280]">(optional)</span>
            </p>
            <div className="flex w-full items-center gap-3 rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#cbd0d8]">
                <img src={fileIcon} alt="" className="h-[14.5px] w-[11.8px]" />
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <p className="text-sm font-medium text-text-primary">Receipt.png</p>
                <p className="text-[11px] text-[#6b7280]">1.2 MB · Uploaded</p>
              </div>
              <HdsButton variant="link">View</HdsButton>
              <button
                type="button"
                aria-label="Remove receipt"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2"
              >
                <img src={cancelIcon} alt="" className="size-3" />
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col gap-4">
            <HdsButton
              fullWidth
              disabled={!isValid}
              onClick={() => navigate('/requests', { state: { reimbursementSubmitted: true } })}
            >
              Submit claim
            </HdsButton>
            <HdsButton variant="secondary" fullWidth onClick={() => navigate('/requests')}>
              Save as draft
            </HdsButton>
          </div>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
