import { ReadyToSubmitScreen } from './shared'

// Figma 45033:204592 — "Ready to submit?" drawer over the New bill form (one-time bill).
export default function ManualEntryReadyToSubmitPanelOneTime() {
  return <ReadyToSubmitScreen recurring={false} />
}
