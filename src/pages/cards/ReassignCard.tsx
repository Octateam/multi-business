import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'
import { HdsButton, HdsInput, HdsSelect } from '../../components/ui/hds'
import { FLAGS, KitAmountInput } from '../bills2/hdsKit'
import { CardRender, MEMBERS, MEMBER_OPTIONS, SummaryRow, formatAmountInput } from './create/parts'
import { getCard, notify, updateCard, usd, useCardStore } from './cardStore'

// Reassign card (Figma 48062:251995): the card form with only "Assign to" editable. "Reassign card" stays
// disabled until a different team member is picked; confirming returns to Cards with "Card reassigned".

const USD_UNITS = [{ value: 'USD', label: 'USD', icon: <img src={FLAGS.US} alt="" className="size-4 rounded-full" /> }]

export default function ReassignCard() {
  const navigate = useNavigate()
  const location = useLocation()
  useCardStore()
  const card = getCard(new URLSearchParams(location.search).get('id')) ?? getCard('c3')!
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const member = MEMBERS.find((m) => m.id === assigneeId)
  const holder = member?.name ?? card.assignee
  const changed = Boolean(member && member.name !== card.assignee)

  const reassign = () => {
    if (!member) return
    updateCard(card.id, { assignee: member.name, assigneeRole: member.role })
    notify('Card reassigned', `This card has been reassigned to ${member.name}.`)
    navigate('/cards')
  }

  return (
    <AppShell>
      <main className="flex w-full flex-col gap-6 pb-16 pt-8">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Reassign card</h1>
          <button type="button" onClick={() => navigate('/cards')} className="text-sm font-medium text-[#4b5563] hover:text-[#111927]">
            Cancel
          </button>
        </div>
        <div className="grid w-full grid-cols-[minmax(300px,380px)_minmax(0,1fr)] items-start gap-8">
          <section className="sticky top-6 flex flex-col gap-6 rounded-2xl border border-[#edeff2] bg-white p-6">
            <CardRender nickname={card.nickname} holder={holder} last4={card.last4} />
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-[0.06em] text-[#9aa1ac]">Summary</p>
              <dl>
                <SummaryRow label="Cardholder name" value={holder} />
                <SummaryRow label="Card type" value={`${card.type} card`} />
                <SummaryRow label="Nickname" value={card.nickname} />
                <SummaryRow label="Spend purpose" value={card.purpose} />
                <SummaryRow label="Limit type" value={card.limitType} />
                <SummaryRow label="Spending cap" value={usd(card.cap)} />
              </dl>
            </div>
          </section>
          <section className="flex flex-col gap-6 rounded-2xl border border-[#edeff2] bg-white p-8">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-[#222121]">Card Information</h2>
              <p className="text-sm text-[#555354]">Setup a card for seamless spending control</p>
            </div>
            <HdsSelect
              label="Assign to"
              placeholder="Select…"
              options={MEMBER_OPTIONS.map((o) => ({ ...o, disabled: o.label === card.assignee }))}
              value={assigneeId}
              onChange={setAssigneeId}
              helper="Select the team member that will use this card"
              menuMode="inline"
            />
            <HdsInput label="Card type" value={`${card.type} card`} disabled readOnly />
            <HdsInput label="Card nickname" value={card.nickname} disabled readOnly helper="Something descriptive, easy to recall and maximum number of 20 characters" />
            <HdsSelect label="Spend purpose" options={[{ value: card.purpose, label: card.purpose }]} value={card.purpose} onChange={() => {}} disabled />
            <HdsSelect label="Limit" options={[{ value: card.limitType, label: card.limitType }]} value={card.limitType} onChange={() => {}} disabled helper="Choose how the spending cap is applied" />
            <KitAmountInput label="Limit amount" units={USD_UNITS} unit="USD" symbol="$" value={formatAmountInput(card.cap.toFixed(2))} disabled />
            <div className="flex justify-end border-t border-[#eff2f4] pt-6">
              <HdsButton disabled={!changed} onClick={reassign}>
                Reassign card
              </HdsButton>
            </div>
          </section>
        </div>
      </main>
    </AppShell>
  )
}
