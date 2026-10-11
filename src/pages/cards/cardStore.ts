import { useSyncExternalStore } from 'react'

// Shared card data for the Cards pages. The router remounts pages on navigation, so a module-level
// store (read with useSyncExternalStore) keeps freezes, reassignments, edits and funding consistent
// between the Cards list, the card drawers, the card details page and the Reassign / Edit pages.

export type CardStatus = 'active' | 'deleted' | 'inactive' | 'frozen'
export type CardType = 'Physical' | 'Virtual'

export type Card = {
  id: string
  assignee: string
  assigneeRole: string
  nickname: string
  last4: string
  number: string
  expiry: string
  cvv: string
  spentToday: number
  type: CardType
  balance: number
  status: CardStatus
  purpose: string
  limitType: 'Daily' | 'Monthly' | 'Total'
  cap: number
  spent: number
}

// Rows from Figma node 46333:357404 ("Cards — Redesign"), with the card-detail fields from 48062:239054.
const INITIAL: Card[] = [
  { id: 'c1', assignee: 'Jane Marris', assigneeRole: 'Finance', nickname: 'Consulting', last4: '5601', number: '4549 8800 5200 5601', expiry: '10/2031', cvv: '180', spentToday: 3100, type: 'Physical', balance: 45.67, status: 'active', purpose: 'Consulting fees', limitType: 'Monthly', cap: 5000, spent: 3100 },
  { id: 'c2', assignee: 'Adolphus Jarvis', assigneeRole: 'Support', nickname: 'Cha-ching', last4: '5601', number: '4549 8800 5201 5601', expiry: '04/2030', cvv: '412', spentToday: 200, type: 'Virtual', balance: 2300, status: 'active', purpose: 'Invoice payment', limitType: 'Monthly', cap: 3000, spent: 200 },
  { id: 'c3', assignee: 'Thomas Deca', assigneeRole: 'Admin', nickname: 'Go hard', last4: '5601', number: '4549 8800 5202 5601', expiry: '08/2029', cvv: '933', spentToday: 350, type: 'Physical', balance: 150, status: 'active', purpose: 'Bills and utilities', limitType: 'Monthly', cap: 1200, spent: 350 },
  { id: 'c4', assignee: 'Decagon Panter', assigneeRole: 'Support', nickname: 'Lunch', last4: '5601', number: '4549 8800 5203 5601', expiry: '01/2029', cvv: '271', spentToday: 450, type: 'Virtual', balance: 1200, status: 'deleted', purpose: 'Event expenses', limitType: 'Daily', cap: 500, spent: 450 },
  { id: 'c5', assignee: 'Wanda Maximoff', assigneeRole: 'Finance', nickname: 'Advertising', last4: '5601', number: '4549 8800 5204 5601', expiry: '12/2030', cvv: '648', spentToday: 4200, type: 'Virtual', balance: 3800, status: 'inactive', purpose: 'Invoice payment', limitType: 'Monthly', cap: 10000, spent: 4200 },
  { id: 'c6', assignee: 'Wanda Maximoff', assigneeRole: 'Finance', nickname: 'Suppliers', last4: '5601', number: '4549 8800 5205 5601', expiry: '06/2031', cvv: '305', spentToday: 450, type: 'Virtual', balance: 150, status: 'inactive', purpose: 'Equipment purchase', limitType: 'Total', cap: 2500, spent: 450 },
]

type State = { cards: Card[]; accountBalance: number; notice: { title: string; body: string } | null }

let state: State = { cards: INITIAL, accountBalance: 530000, notice: null }
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export const useCardStore = () => useSyncExternalStore(subscribe, () => state, () => state)
export const getCard = (id: string | null) => state.cards.find((c) => c.id === id)

export function updateCard(id: string, patch: Partial<Card>) {
  state = { ...state, cards: state.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
  emit()
}
export function addCard(card: Card) {
  state = { ...state, cards: [card, ...state.cards.filter((c) => c.id !== card.id)] }
  emit()
}
export function adjustAccountBalance(delta: number) {
  state = { ...state, accountBalance: state.accountBalance + delta }
  emit()
}
/** Green confirmation notice shown on the Cards page ("Card frozen", "Card reassigned", …). */
export function notify(title: string, body: string) {
  state = { ...state, notice: { title, body } }
  emit()
}
export function clearNotice() {
  state = { ...state, notice: null }
  emit()
}

export const usd = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
