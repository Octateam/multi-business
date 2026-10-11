import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:202543 — vendor search menu open with "North" typed.
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ManualEntryVendorSearch() {
  return (
    <AddBillShell>
      <AddBillForm
        vendorValue="North"
        vendorFocused
        currencyLabel="USD - US Dollar"
      />
    </AddBillShell>
  )
}
