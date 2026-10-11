import { VendorDetailsScreen } from './VendorDetails'

/** Vendor details — Bills tab (Figma 48069:431901). Renders the unified, interactive vendor details page in this initial state. */
export default function AmazonWebServicesBillsTab() {
  return <VendorDetailsScreen initial={{ tab: 'bills' }} />
}
