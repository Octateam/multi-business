import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton } from '../../components/ui/hds'
import editIcon from '../../assets/icons/claim-manual-edit.svg'
import { BackLink, ManualEntryShell, setPendingNewAccount } from './shared'
import { hasInAppHistory, useGoBack } from '../../lib/navHistory'
import type { AccountForm } from './AddAccount'

// Figma sample data (node 45766:411027) — used when this screen is opened directly from
// /screens rather than via the Add-account form, so it never renders blank.
const FALLBACK: AccountForm = {
  country: 'United States of America',
  currency: 'USD',
  accountName: 'Northwind Studios Ltd',
  accountType: 'Checking',
  accountNumber: '4350437854',
  bankName: 'Chase Bank',
  routingNumber: '123243424',
  swiftBic: 'TESTU3DCCS',
  address: '14 Charles Gallagher Owolabi street, Lekki, Lagos state, Nigeria',
}

function maskAccountNumber(value: string) {
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between gap-4 border-b border-[#eff2f4] py-2 last:border-b-0">
      <p className="text-[13px] text-[#6b7280]">{label}</p>
      <p className="max-w-[253px] text-right text-[13px] font-medium text-text-primary">{value}</p>
    </div>
  )
}

export default function AddAccountReview() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { account?: AccountForm; fromForm?: boolean } | null }
  const goBack = useGoBack('/claim-reimbursement/manual-entry/add-account')
  const account = location.state?.account ?? FALLBACK

  const addPaymentMethod = () => {
    const newAccount = `${account.accountName} · ${account.bankName} · ${account.accountNumber} · ${account.currency ?? 'USD'}`
    // Came from the claim form via Add account: return to that same form entry (fields restored)
    // so its Back still leads to where the claim started; otherwise open the form with the account.
    if (location.state?.fromForm && hasInAppHistory()) {
      setPendingNewAccount(newAccount)
      navigate(-2)
    } else navigate('/claim-reimbursement/manual-entry', { state: { newAccount } })
  }

  return (
    <AppShell>
      <ManualEntryShell>
        <div className="flex h-full w-full flex-col justify-between">
          <div className="flex w-full flex-col gap-6">
            <BackLink onClick={goBack} />

            <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Review</h1>

            <div className="flex w-full flex-col gap-2.5 rounded-lg border border-[#e3e8eb] p-[15px]">
              <div className="flex w-full items-center justify-between">
                <p className="text-xs font-semibold text-[#0c2129]">Account information</p>
                <HdsButton
                  variant="secondary"
                  size="sm"
                  shape="pill"
                  onClick={() => navigate(-1)}
                  trailingIcon={<img src={editIcon} alt="" className="size-4" />}
                >
                  Continue
                </HdsButton>
              </div>
              <div className="flex w-full flex-col pt-1">
                {account.country && <Row label="Country" value={account.country} />}
                <Row label="Account name" value={account.accountName} />
                <Row label="Account type" value={account.accountType} />
                <Row label="Account number" value={maskAccountNumber(account.accountNumber)} />
                <Row label="Bank name" value={account.bankName} />
                <Row label="Routing number" value={account.routingNumber} />
                <Row label="SWIFT/BIC" value={account.swiftBic} />
                {account.address && <Row label="Address" value={account.address} />}
              </div>
            </div>
          </div>

          <HdsButton fullWidth className="mt-8" onClick={addPaymentMethod}>
            Add payment method
          </HdsButton>
        </div>
      </ManualEntryShell>
    </AppShell>
  )
}
