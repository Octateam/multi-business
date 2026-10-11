import type { RequestType } from './requests'

/**
 * The full record behind each row of the Requests table — everything the detail page shows
 * (expense fields, beneficiary, payout summary, timeline dates, requested-information thread).
 * Status and viewer role live on the row (data/requests.ts); status changes made in the prototype
 * live in data/requestStore.ts.
 */
export type RequestInfoMessage = { from: string; message: string; date: string }

export type RequestDetail = {
  id: string
  requester: { name: string; initials: string; email: string }
  payee: string
  /** Vendor reference shown after the payee on vendor-payment requests (e.g. "VND-00507"). */
  vendorRef?: string
  type: RequestType
  currency: string
  amount: string
  tax?: string
  category: string
  description: string
  datePaid?: string
  invoiceDate?: string
  dateCreated: string
  dueDate: string
  submittedOn: string
  processedOn: string
  pendingSince: string
  approvedBy?: string
  approvedOn?: string
  paidOn?: string
  /** Rejection or cancellation note shown on the timeline. */
  closeReason?: string
  closedOn?: string
  failure?: { reason: string; date: string }
  requestedInfo?: RequestInfoMessage[]
  infoProvided?: { note: string; document?: string; date: string }
  billId?: string
  beneficiary: {
    name: string
    meta: string
    rows: { label: string; value: string }[]
  }
  payout: { label: string; value: string }[]
  /** Short destination line used by the "Approve this request?" review drawer. */
  destination: string
  estimatedPayout: string
  receipt: { filename: string; kind: 'receipt' | 'invoice' }
}

const PRIYA_BANK = [
  { label: 'Recipient name', value: 'Priya Raman' },
  { label: 'Account holder type', value: 'Personal' },
  { label: 'Bank name', value: 'Chase Bank' },
  { label: 'Account number', value: '1234567890' },
  { label: 'Routing number', value: '021000021' },
  { label: 'Account type', value: 'Checking' },
  { label: 'Currency', value: 'NGN' },
  { label: 'SWIFT/BIC', value: 'CHASUS33' },
]

const EUR_PAYOUT = [
  { label: 'Amount', value: '€120.00' },
  { label: 'Fees', value: '€10.00' },
  { label: 'Estimated payout', value: '₦210,400.00' },
  { label: 'Exchange rate (indicative)', value: '1 EUR = 1753.33 NGN' },
]

function personalBank(name: string, bank: string, account: string, currency: string, swift: string, routing = '021000021') {
  return [
    { label: 'Recipient name', value: name },
    { label: 'Account holder type', value: 'Personal' },
    { label: 'Bank name', value: bank },
    { label: 'Account number', value: account },
    { label: 'Routing number', value: routing },
    { label: 'Account type', value: 'Checking' },
    { label: 'Currency', value: currency },
    { label: 'SWIFT/BIC', value: swift },
  ]
}

function businessBank(name: string, bank: string, account: string, currency: string, swift: string, routing = '026009593') {
  return [
    { label: 'Recipient name', value: name },
    { label: 'Account holder type', value: 'Business' },
    { label: 'Bank name', value: bank },
    { label: 'Account number', value: account },
    { label: 'Routing number', value: routing },
    { label: 'Account type', value: 'Checking' },
    { label: 'Currency', value: currency },
    { label: 'SWIFT/BIC', value: swift },
  ]
}

function usdPayout(amount: string, fee = '$2.50') {
  const n = Number(amount.replace(/[^\d.]/g, ''))
  const f = Number(fee.replace(/[^\d.]/g, ''))
  const fmt = (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return [
    { label: 'Amount', value: amount },
    { label: 'Fees', value: fee },
    { label: 'Estimated payout', value: fmt(n - f) },
    { label: 'Exchange rate (indicative)', value: '1 USD = 1.00 USD' },
  ]
}

const THOMAS_REQUESTS: RequestInfoMessage[] = [
  {
    from: 'Thomas Bennett',
    message: 'The receipt amount doesn’t match the amount submitted. Please submit a new expense with the correct amount.',
    date: '28 Jul 2026',
  },
  { from: 'Thomas Bennett', message: 'The receipt is hard to read. Can you upload a clearer photo?', date: '28 Jul 2026' },
]

export const requestDetails: Record<string, RequestDetail> = {
  // Figma 41684:336063 — Cancelled
  'REQ-2051': {
    id: 'REQ-2051',
    requester: { name: 'Priya Raman', initials: 'PR', email: 'priya.raman@acmetrading.com' },
    payee: 'Lisboa Trattoria',
    type: 'Reimbursement',
    currency: 'EUR',
    amount: '€120.00',
    tax: '€14.40 (IVA 13%)',
    category: 'Meals and entertainment',
    description: 'Client lunch with the Northwind team',
    datePaid: '17 Jul 2026, 4:21pm EST',
    dateCreated: '20 Jun 2026, 3:15am EST',
    dueDate: '28 Jul 2026, 8:32pm EST',
    submittedOn: '28 Jul 2026',
    processedOn: '28 Jul 2026',
    pendingSince: '31 Jul 2026',
    closeReason: '“This was a personal meal, not a client expense.”',
    closedOn: '31 Jul 2026',
    beneficiary: { name: 'Priya Raman', meta: 'USD · Bank account', rows: PRIYA_BANK.map((r) => (r.label === 'Currency' ? { ...r, value: 'USD' } : r)) },
    payout: EUR_PAYOUT,
    destination: 'Bank account · Nigeria · ••••8830',
    estimatedPayout: '₦210,400',
    receipt: { filename: 'receipt.jpg', kind: 'receipt' },
  },
  // Figma 37485:243 / 42557:353274 — vendor payment; here the approver has asked for more info and
  // the requester has answered (Needs action, approver view — Figma 41715:339991 pattern).
  'REQ-2052': {
    id: 'REQ-2052',
    requester: { name: 'Dana Avery', initials: 'DA', email: 'dana.avery@acmetrading.com' },
    payee: 'Meridian Legal Partners',
    vendorRef: 'VND-00507',
    type: 'Vendor payment',
    currency: 'USD',
    amount: '$4,800.00',
    category: 'Professional services',
    description: 'Additional advisory hours on the Singapore entity setup',
    invoiceDate: '30 Jul 2026',
    dateCreated: '20 Jun 2026, 3:15am EST',
    dueDate: '28 Jul 2026, 8:32pm EST',
    submittedOn: '28 Jul 2026',
    processedOn: '28 Jul 2026',
    pendingSince: '29 Jul 2026',
    requestedInfo: [{ from: 'John Doe', message: 'Please attach the signed engagement letter for the extra advisory hours.', date: '29 Jul 2026' }],
    infoProvided: { note: 'Requested information has been provided', document: 'Engagement_letter_signed.pdf', date: '31 Jul 2026' },
    beneficiary: { name: 'Meridian Legal Partners', meta: 'USD · Bank account', rows: businessBank('Meridian Legal Partners', 'JPMorgan Chase', '4410982215', 'USD', 'CHASUS33') },
    payout: usdPayout('$4,800.00', '$15.00'),
    destination: 'Bank account · United States · ••••2215',
    estimatedPayout: '$4,785.00',
    receipt: { filename: 'INV-MLP-2291.pdf', kind: 'invoice' },
  },
  // Figma 42563:369121 — Pending approval, requester view (Cancel / Edit request)
  'REQ-2053': {
    id: 'REQ-2053',
    requester: { name: 'Emily Xin', initials: 'EX', email: 'emily.xin@acmetrading.com' },
    payee: 'Figma',
    type: 'Reimbursement',
    currency: 'USD',
    amount: '$45.00',
    tax: '$3.60 (Sales tax 8%)',
    category: 'Software',
    description: 'Figma Professional seat — January',
    datePaid: '2 Jan 2026, 9:12am EST',
    dateCreated: '6 Jan 2026, 2:14pm EST',
    dueDate: '7 Jan 2026, 5:00pm EST',
    submittedOn: '6 Jan 2026',
    processedOn: '6 Jan 2026',
    pendingSince: '6 Jan 2026',
    beneficiary: { name: 'Emily Xin', meta: 'USD · Bank account', rows: personalBank('Emily Xin', 'Bank of America', '3398201746', 'USD', 'BOFAUS3N', '026009593') },
    payout: usdPayout('$45.00', '$0.90'),
    destination: 'Bank account · United States · ••••1746',
    estimatedPayout: '$44.10',
    receipt: { filename: 'figma-invoice-jan.png', kind: 'receipt' },
  },
  // Figma 37463:456 — Paid
  'REQ-2054': {
    id: 'REQ-2054',
    requester: { name: 'Sarah Owens', initials: 'SO', email: 'sarah.owens@acmetrading.com' },
    payee: 'Haclyon Studio',
    type: 'Reimbursement',
    currency: 'USD',
    amount: '$5,000.00',
    tax: '$400.00 (Sales tax 8%)',
    category: 'Professional services',
    description: 'Brand photography for the Q1 campaign',
    datePaid: '14 Dec 2025, 1:05pm EST',
    dateCreated: '18 Dec 2025, 10:20am EST',
    dueDate: '8 Jan 2026, 5:00pm EST',
    submittedOn: '18 Dec 2025',
    processedOn: '18 Dec 2025',
    pendingSince: '19 Dec 2025',
    approvedBy: 'John Doe',
    approvedOn: '20 Dec 2025',
    paidOn: '22 Dec 2025',
    beneficiary: { name: 'Sarah Owens', meta: 'USD · Bank account', rows: personalBank('Sarah Owens', 'Wells Fargo', '7720448391', 'USD', 'WFBIUS6S', '121000248') },
    payout: usdPayout('$5,000.00', '$12.50'),
    destination: 'Bank account · United States · ••••8391',
    estimatedPayout: '$4,987.50',
    receipt: { filename: 'haclyon-invoice-0192.pdf', kind: 'receipt' },
  },
  // Figma 42563:369947 — Payment failed (Retry payment)
  'REQ-2055': {
    id: 'REQ-2055',
    requester: { name: 'Tyler Bates', initials: 'TB', email: 'tyler.bates@acmetrading.com' },
    payee: 'Uber',
    vendorRef: 'VND-00213',
    type: 'Vendor payment',
    currency: 'GBP',
    amount: '£400.00',
    category: 'Travel',
    description: 'Uber for Business — December team rides (London office)',
    invoiceDate: '31 Dec 2025',
    dateCreated: '2 Jan 2026, 8:40am EST',
    dueDate: '20 Jan 2026, 5:00pm EST',
    submittedOn: '2 Jan 2026',
    processedOn: '2 Jan 2026',
    pendingSince: '2 Jan 2026',
    approvedBy: 'John Doe',
    approvedOn: '3 Jan 2026',
    failure: { reason: 'Not enough available balance in GBP operating. Retry 2 of 4 runs', date: '4 Jan 2026' },
    beneficiary: { name: 'Uber London Ltd', meta: 'GBP · Bank account', rows: businessBank('Uber London Ltd', 'Barclays', '20419837', 'GBP', 'BARCGB22', '20-00-00') },
    payout: [
      { label: 'Amount', value: '£400.00' },
      { label: 'Fees', value: '£1.50' },
      { label: 'Estimated payout', value: '£398.50' },
      { label: 'Exchange rate (indicative)', value: '1 GBP = 1.27 USD' },
    ],
    destination: 'Bank account · United Kingdom · ••••9837',
    estimatedPayout: '£398.50',
    receipt: { filename: 'uber-business-dec.pdf', kind: 'invoice' },
  },
  // Figma 42563:372084 — Payment pending (Make payment)
  'REQ-2056': {
    id: 'REQ-2056',
    requester: { name: 'Grace Jameson', initials: 'GJ', email: 'grace.jameson@acmetrading.com' },
    payee: 'Northwind Design Ltd',
    type: 'Reimbursement',
    currency: 'EUR',
    amount: '€120.00',
    tax: '€14.40 (IVA 13%)',
    category: 'Office supplies',
    description: 'Sketchbooks and prototyping materials for the design sprint',
    datePaid: '29 Dec 2025, 3:30pm EST',
    dateCreated: '2 Jan 2026, 11:15am EST',
    dueDate: '—',
    submittedOn: '2 Jan 2026',
    processedOn: '2 Jan 2026',
    pendingSince: '3 Jan 2026',
    approvedBy: 'John Doe',
    approvedOn: '5 Jan 2026',
    beneficiary: { name: 'Grace Jameson', meta: 'NGN · Bank account', rows: personalBank('Grace Jameson', 'Access Bank', '0021883047', 'NGN', 'ABNGNGLA', '—') },
    payout: EUR_PAYOUT,
    destination: 'Bank account · Nigeria · ••••3047',
    estimatedPayout: '₦210,400',
    receipt: { filename: 'receipt.jpg', kind: 'receipt' },
  },
  // Figma 37463:669 — Rejected (requester's own request)
  'REQ-2057': {
    id: 'REQ-2057',
    requester: { name: 'Emily Xin', initials: 'EX', email: 'emily.xin@acmetrading.com' },
    payee: 'Deliveroo',
    type: 'Reimbursement',
    currency: 'GBP',
    amount: '£34.00',
    tax: '£5.67 (VAT 20%)',
    category: 'Meals and entertainment',
    description: 'Late-night team dinner during the release',
    datePaid: '3 Jan 2026, 10:48pm EST',
    dateCreated: '4 Jan 2026, 9:02am EST',
    dueDate: '8 Feb 2026, 5:00pm EST',
    submittedOn: '4 Jan 2026',
    processedOn: '4 Jan 2026',
    pendingSince: '4 Jan 2026',
    closeReason: '“Team meals over £30 need pre-approval from the department head.”',
    closedOn: '5 Jan 2026',
    beneficiary: { name: 'Emily Xin', meta: 'USD · Bank account', rows: personalBank('Emily Xin', 'Bank of America', '3398201746', 'USD', 'BOFAUS3N', '026009593') },
    payout: [
      { label: 'Amount', value: '£34.00' },
      { label: 'Fees', value: '£0.50' },
      { label: 'Estimated payout', value: '$42.55' },
      { label: 'Exchange rate (indicative)', value: '1 GBP = 1.27 USD' },
    ],
    destination: 'Bank account · United States · ••••1746',
    estimatedPayout: '$42.55',
    receipt: { filename: 'deliveroo-order.png', kind: 'receipt' },
  },
  // Figma 45476:511964 / 42563:372477 — Pending approval (approver view, overdue)
  'REQ-2058': {
    id: 'REQ-2058',
    requester: { name: 'Priya Raman', initials: 'PR', email: 'priya.raman@acmetrading.com' },
    payee: 'Lisboa Trattoria',
    type: 'Reimbursement',
    currency: 'EUR',
    amount: '€120.00',
    tax: '€14.40 (IVA 13%)',
    category: 'Meals and entertainment',
    description: 'Client lunch with the Northwind team',
    datePaid: '17 Jul 2026, 4:21pm EST',
    dateCreated: '20 Jun 2026, 3:15am EST',
    dueDate: '28 Jul 2026, 8:32pm EST',
    submittedOn: '28 Jul 2026',
    processedOn: '28 Jul 2026',
    pendingSince: '31 Jul 2026',
    beneficiary: { name: 'Priya Raman', meta: 'USD · Bank account', rows: PRIYA_BANK },
    payout: EUR_PAYOUT,
    destination: 'Bank account · Nigeria · ••••8830',
    estimatedPayout: '₦210,400',
    receipt: { filename: 'receipt.jpg', kind: 'receipt' },
  },
  // Figma 37463:882 — Needs action, requester view (Provide further details)
  'REQ-2059': {
    id: 'REQ-2059',
    requester: { name: 'Emily Xin', initials: 'EX', email: 'emily.xin@acmetrading.com' },
    payee: 'Notion Labs',
    type: 'Reimbursement',
    currency: 'USD',
    amount: '$96.00',
    tax: '$7.68 (Sales tax 8%)',
    category: 'Software',
    description: 'Notion Plus — annual plan for the ops workspace',
    datePaid: '3 Jan 2026, 2:00pm EST',
    dateCreated: '5 Jan 2026, 11:02am EST',
    dueDate: '9 Jan 2026, 5:00pm EST',
    submittedOn: '5 Jan 2026',
    processedOn: '5 Jan 2026',
    pendingSince: '5 Jan 2026',
    requestedInfo: THOMAS_REQUESTS,
    beneficiary: { name: 'Emily Xin', meta: 'USD · Bank account', rows: personalBank('Emily Xin', 'Bank of America', '3398201746', 'USD', 'BOFAUS3N', '026009593') },
    payout: usdPayout('$96.00', '$0.90'),
    destination: 'Bank account · United States · ••••1746',
    estimatedPayout: '$95.10',
    receipt: { filename: 'notion-receipt.png', kind: 'receipt' },
  },
  // Figma note 43444:406894 — the second "pending" state: approved by the approver, waiting for
  // payment, seen by the requester (no CTAs, timeline shows Approved).
  'REQ-2060': {
    id: 'REQ-2060',
    requester: { name: 'Emily Xin', initials: 'EX', email: 'emily.xin@acmetrading.com' },
    payee: 'WeWork',
    type: 'Reimbursement',
    currency: 'USD',
    amount: '$350.00',
    tax: '$28.00 (Sales tax 8%)',
    category: 'Travel',
    description: 'Hot desk day passes during the Lagos client visit',
    datePaid: '2 Jan 2026, 8:30am EST',
    dateCreated: '4 Jan 2026, 4:25pm EST',
    dueDate: '10 Jan 2026, 5:00pm EST',
    submittedOn: '4 Jan 2026',
    processedOn: '4 Jan 2026',
    pendingSince: '4 Jan 2026',
    approvedBy: 'John Doe',
    approvedOn: '5 Jan 2026',
    beneficiary: { name: 'Emily Xin', meta: 'USD · Bank account', rows: personalBank('Emily Xin', 'Bank of America', '3398201746', 'USD', 'BOFAUS3N', '026009593') },
    payout: usdPayout('$350.00', '$2.50'),
    destination: 'Bank account · United States · ••••1746',
    estimatedPayout: '$347.50',
    receipt: { filename: 'wework-daypass.pdf', kind: 'receipt' },
  },
  // Figma 42557:353274 — Vendor payment, pending approval (approver view)
  'REQ-2061': {
    id: 'REQ-2061',
    requester: { name: 'Dana Avery', initials: 'DA', email: 'dana.avery@acmetrading.com' },
    payee: 'Brightline Logistics',
    vendorRef: 'VND-00642',
    type: 'Vendor payment',
    currency: 'USD',
    amount: '$2,350.00',
    category: 'Shipping and logistics',
    description: 'Freight forwarding for the December inventory restock',
    invoiceDate: '2 Jan 2026',
    dateCreated: '4 Jan 2026, 10:18am EST',
    dueDate: '7 Jan 2026, 5:00pm EST',
    submittedOn: '4 Jan 2026',
    processedOn: '4 Jan 2026',
    pendingSince: '4 Jan 2026',
    beneficiary: { name: 'Brightline Logistics', meta: 'USD · Bank account', rows: businessBank('Brightline Logistics LLC', 'Citibank', '9081726354', 'USD', 'CITIUS33', '021000089') },
    payout: usdPayout('$2,350.00', '$8.00'),
    destination: 'Bank account · United States · ••••6354',
    estimatedPayout: '$2,342.00',
    receipt: { filename: 'BL-INV-77810.pdf', kind: 'invoice' },
  },
  // Figma 37512:19023 — Vendor payment approved, became a bill (Payment pending)
  'REQ-2062': {
    id: 'REQ-2062',
    requester: { name: 'Dana Avery', initials: 'DA', email: 'dana.avery@acmetrading.com' },
    payee: 'Kestrel Cloud Services',
    vendorRef: 'VND-00388',
    type: 'Vendor payment',
    currency: 'USD',
    amount: '$1,920.00',
    category: 'Software',
    description: 'Managed Kubernetes hosting — December usage',
    invoiceDate: '1 Jan 2026',
    dateCreated: '3 Jan 2026, 3:51pm EST',
    dueDate: '12 Jan 2026, 5:00pm EST',
    submittedOn: '3 Jan 2026',
    processedOn: '3 Jan 2026',
    pendingSince: '3 Jan 2026',
    approvedBy: 'John Doe',
    approvedOn: '4 Jan 2026',
    billId: 'NWD-0041',
    beneficiary: { name: 'Kestrel Cloud Services', meta: 'USD · Bank account', rows: businessBank('Kestrel Cloud Services Inc.', 'Silicon Valley Bank', '3300918274', 'USD', 'SVBKUS6S', '121140399') },
    payout: usdPayout('$1,920.00', '$6.00'),
    destination: 'Bank account · United States · ••••8274',
    estimatedPayout: '$1,914.00',
    receipt: { filename: 'KCS-INV-2025-12.pdf', kind: 'invoice' },
  },
}
