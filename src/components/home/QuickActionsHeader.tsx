import Button from '../ui/Button'

const secondaryActions = ['Add Money', 'Transfers', 'Create Payment Link', 'Create Invoice']

/** `onAction` intercepts every quick action — used when the business isn't active yet. */
export default function QuickActionsHeader({ onAction }: { onAction?: (label: string) => void } = {}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-quaternary">Friday, January 10th 2025</p>
        <p className="font-heading text-[28px] leading-8 text-text-primary">Welcome, Smith.</p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-3">
        <Button variant="primary" size="lg" shape="pill" onClick={() => onAction?.('Send Money')}>
          Send Money
        </Button>
        {secondaryActions.map((label) => (
          <Button
            key={label}
            variant="secondary"
            size="lg"
            shape="pill"
            // Product decision: home quick actions are grey, not the blue HDS secondary.
            className="!bg-[#edeff2] !text-[#111927] hover:!bg-[#e1e4e9]"
            onClick={() => onAction?.(label)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
