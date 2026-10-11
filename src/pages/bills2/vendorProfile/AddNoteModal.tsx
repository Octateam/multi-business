import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Add note modal (Figma 48069:435251). Renders the unified, interactive vendor details page in this initial state. */
export default function AddNoteModal() {
  return <VendorDetailsScreen initial={{ tab: 'notes', addNote: true }} />
}
