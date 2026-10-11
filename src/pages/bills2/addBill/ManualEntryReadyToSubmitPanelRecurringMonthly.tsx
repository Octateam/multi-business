import { ReadyToSubmitScreen } from './shared'

// Figma 45033:204923 — "Ready to submit?" drawer over the New bill form (recurring bill; the schedule
// row shows whatever frequency was chosen).
export default function ManualEntryReadyToSubmitPanelRecurringMonthly() {
  return <ReadyToSubmitScreen recurring />
}
