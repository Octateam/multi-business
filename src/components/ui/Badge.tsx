import { HdsBadge, type BadgeColor } from './hds'

export type BadgeStatus =
  | 'approved'
  | 'paid'
  | 'rejected'
  | 'pending'
  | 'info'
  | 'info-needed'
  | 'payment-failed'
  | 'cancelled'
  | 'draft'
  | 'neutral'

// Status → HDS Badge colour (Figma HDS 798:7, Style=Filled, Size=md).
const STATUS_COLOR: Record<BadgeStatus, BadgeColor> = {
  approved: 'green',
  paid: 'green',
  rejected: 'red',
  'payment-failed': 'red',
  cancelled: 'grey',
  pending: 'amber',
  info: 'navy',
  'info-needed': 'navy',
  draft: 'grey',
  neutral: 'grey',
}

export default function Badge({ status, label, dot }: { status: BadgeStatus; label: string; dot?: boolean }) {
  return (
    <HdsBadge color={STATUS_COLOR[status]} dot={dot}>
      {label}
    </HdsBadge>
  )
}
