import { AddBillShell, AddBillForm } from './shared'

// Figma 45033:201184 — New bill, manual entry (empty). Entry point for "Add bill" / "Create bill".
// Every interaction happens in place on this form (vendor search, schedule switch, frequency/day menus);
// "Submit for approval" stores the bill and opens "Ready to submit?" with exactly what was entered.
export default function ManualEntryEmpty() {
  return (
    <AddBillShell>
      <AddBillForm
        currencyLabel="USD - US Dollar"
      />
    </AddBillShell>
  )
}
