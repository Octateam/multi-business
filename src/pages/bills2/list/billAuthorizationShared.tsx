import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { HdsBadge, HdsButton, type BadgeColor, type SelectOption } from '../../../components/ui/hds'
import { KitSelect } from '../hdsKit'
import cancelSquare from '../../../assets/icons/list3-cancel-square.svg'
import personIcon from '../../../assets/icons/list3-approval-person-icon.svg'
import clockIcon from '../../../assets/icons/list3-clock-icon.svg'
import gearIcon from '../../../assets/icons/list3-manage-workflow-icon.svg'
import chevronUp from '../../../assets/icons/list3-chevron-approvers-up.svg'
import chevronDown from '../../../assets/icons/list3-chevron-approvers-down.svg'

function Card({ children }: { children: ReactNode }) {
  return <div className="flex w-full flex-col gap-4 rounded-xl border border-[#e3e8ef] bg-white p-5">{children}</div>
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-3">
        <img src={icon} alt="" className="h-[14px] w-[14px]" />
      </div>
      <p className="text-base font-semibold text-text-primary">{title}</p>
    </div>
  )
}

export type ApprovalStep = {
  active: boolean
  title: string
  badgeLabel: string
  badgeColor: BadgeColor
  description: string
  approversLabel: string
  expanded: boolean
  approvers?: { name: string; role: string }[]
}

function StepDot({ number, active }: { number: number; active: boolean }) {
  return (
    <div
      className={`flex size-5 shrink-0 items-center justify-center rounded-[10px] text-[10px] font-semibold ${ active ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#cbd0d8] bg-white text-[#4b5563]' }`}
    >
      {number}
    </div>
  )
}

function ApprovalStepBlock({ step }: { step: ApprovalStep }) {
  const [expanded, setExpanded] = useState(step.expanded)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex w-full items-center justify-between">
        <p className="text-base font-semibold text-text-primary">{step.title}</p>
        <HdsBadge color={step.badgeColor}>{step.badgeLabel}</HdsBadge>
      </div>
      <p className="text-sm text-[#6b7280]">{step.description}</p>
      <button
        type="button"
        aria-expanded={expanded}
        disabled={!step.approvers?.length}
        onClick={() => setExpanded((e) => !e)}
        className="flex w-fit items-center gap-1 text-sm font-semibold text-[#004b87] hover:text-[#004378] disabled:cursor-default"
      >
        <span>{step.approversLabel}</span>
        <img src={expanded ? chevronUp : chevronDown} alt="" className="h-[5px] w-[9px]" />
      </button>
      {expanded && step.approvers && (
        <div className="flex flex-col gap-3 border-l border-[#edeff2] pl-3">
          {step.approvers.map((a) => (
            <div key={a.name} className="flex w-full gap-4 text-sm">
              <p className="w-[160px] shrink-0 text-[#6b7280]">{a.name}</p>
              <p className="font-medium text-text-primary">{a.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ApprovalWorkflowCard({ steps, totalDots }: { steps: ApprovalStep[]; totalDots: number }) {
  return (
    <Card>
      <CardHeader icon={personIcon} title="Approval workflow" />
      <div className="flex w-full gap-3">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          {Array.from({ length: totalDots }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <StepDot number={i + 1} active={i < steps.length} />
              {i < totalDots - 1 && <div className="h-16 w-px bg-[#edeff2]" />}
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-5">
          {steps.map((step) => (
            <ApprovalStepBlock key={`${step.title}-${step.approvers?.map((a) => a.name).join()}`} step={step} />
          ))}
        </div>
      </div>
    </Card>
  )
}

function ActivityCard() {
  return (
    <Card>
      <CardHeader icon={clockIcon} title="Activity" />
      <div className="relative flex w-full flex-col gap-4">
        <div className="flex w-full items-start gap-3">
          <div className="flex size-[13px] shrink-0 items-center justify-center bg-white">
            <div className="size-[11px] rounded-md border-[2.5px] border-[#12883e] bg-[#12883e]" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-text-primary">Bill submitted for approval</p>
            <p className="text-[11px] text-[#4d5761]">Daniel Adams</p>
          </div>
          <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">Aug 15, 2026, 10:24 AM</p>
        </div>
        <div className="flex w-full items-start gap-3">
          <div className="flex size-[13px] shrink-0 items-center justify-center bg-white">
            <div className="size-[11px] rounded-md border-[2.5px] border-[#9da4ae] bg-[#9da4ae]" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5">
            <p className="text-[13px] font-medium text-[#9aa1ac]">Awaiting approval</p>
            <p className="text-[11px] text-[#9da4ae]">Pending approval</p>
          </div>
          <p className="shrink-0 text-[10px] font-medium tracking-wide text-text-quaternary">Aug 15, 2026, 10:24 AM</p>
        </div>
      </div>
    </Card>
  )
}

// "Who can approve?" — options exactly as shown in Figma (45033:232717).
const WHO_CAN_APPROVE_OPTIONS: SelectOption[] = ['Anyone with approval rights', 'Specific persons', 'Role'].map((o) => ({ value: o, label: o }))

// Team members with approval rights. Figma doesn't show this menu's contents; the first three are the
// eligible approvers shown in the workflow card, plus two other finance team members.
const TEAM_MEMBERS = [
  { name: 'Harriet Underwood', role: 'Admin', email: 'harriet@hinstantt.com' },
  { name: 'Tessa Olsen', role: 'Finance Director', email: 'tessa@hinstantt.com' },
  { name: 'Daniel Adams', role: 'Finance', email: 'daniel@hinstantt.com' },
  { name: 'Fiona Ames', role: 'Finance manager', email: 'fiona@hinstantt.com' },
  { name: 'Priya Raman', role: 'Controller', email: 'priya@hinstantt.com' },
]
const TEAM_MEMBER_OPTIONS: SelectOption[] = TEAM_MEMBERS.map((m) => ({ value: m.name, label: m.name, description: `${m.role} · ${m.email}` }))

// Roles that can be given approval rights (not specified in Figma).
const APPROVER_ROLE_OPTIONS: SelectOption[] = [
  { value: 'Admin', label: 'Admin', description: '1 member' },
  { value: 'Finance Director', label: 'Finance Director', description: '1 member' },
  { value: 'Finance manager', label: 'Finance manager', description: '1 member' },
  { value: 'Finance', label: 'Finance', description: '1 member' },
  { value: 'Controller', label: 'Controller', description: '1 member' },
]

export type BillAuthorizationStep = 'who-can-approve' | 'choose-team-member'

const GENERAL_APPROVERS = [
  { name: 'Harriet Underwood', role: 'Admin' },
  { name: 'Tessa Olsen', role: 'Finance Director' },
  { name: 'Daniel Adams', role: 'Finance' },
]

export default function BillAuthorizationSideSheet({ step }: { step: BillAuthorizationStep }) {
  const navigate = useNavigate()
  const [whoCanApprove, setWhoCanApprove] = useState(step === 'who-can-approve' ? 'Anyone with approval rights' : 'Specific persons')
  const [member, setMember] = useState<string | null>('Tessa Olsen')
  const [role, setRole] = useState<string | null>(null)

  const chosen = TEAM_MEMBERS.find((m) => m.name === member)

  const steps: ApprovalStep[] =
    step === 'who-can-approve'
      ? [
          {
            active: true,
            title: 'General approval',
            badgeLabel: 'Pending',
            badgeColor: 'amber',
            description: 'Anyone with approval rights can approve this bill.',
            approversLabel: '3 eligible approvers',
            expanded: true,
            approvers: GENERAL_APPROVERS,
          },
        ]
      : [
          {
            active: false,
            title: 'General approval',
            badgeLabel: 'Changed',
            badgeColor: 'grey',
            description: 'Anyone with approval rights can approve this bill.',
            approversLabel: '3 eligible approvers',
            expanded: false,
            approvers: GENERAL_APPROVERS,
          },
          {
            active: true,
            title: 'Specific person',
            badgeLabel: 'Pending',
            badgeColor: 'amber',
            description: 'Selected team member(s) can approve this bill',
            approversLabel: chosen ? '1 approvers' : '0 approvers',
            expanded: true,
            approvers: chosen ? [{ name: chosen.name, role: chosen.role }] : [],
          },
        ]

  const totalDots = step === 'who-can-approve' ? 3 : 2
  const canSave = whoCanApprove === 'Specific persons' ? !!member : whoCanApprove === 'Role' ? !!role : true

  return (
    <div className="relative flex h-full w-full">
      {/* Dimmed Bills list background */}
      <div className="flex-1 overflow-hidden py-7">
        <p className="font-heading text-2xl font-semibold text-text-primary">Bills</p>
        <p className="mt-1 text-sm text-text-quaternary">Review, approve, and pay what you owe vendors.</p>
      </div>
      <button
        aria-label="Close bill authorization"
        className="fixed inset-0 cursor-default bg-black/40"
        onClick={() => navigate('/bills')}
      />

      {/* Side sheet */}
      <div className="fixed bottom-10 right-10 top-10 flex w-[560px] flex-col gap-6 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full items-center justify-between">
            <p className="font-heading text-2xl font-semibold text-text-primary">Bill authorization</p>
            <button type="button" onClick={() => navigate('/bills')} aria-label="Close">
              <img src={cancelSquare} alt="" className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-text-quaternary">Approval requirements and activity for bill #INV-024</p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <ApprovalWorkflowCard steps={steps} totalDots={totalDots} />
          <ActivityCard />

          <Card>
            <CardHeader icon={gearIcon} title="Manage workflow" />
            <div className="flex w-full flex-col gap-4">
              <KitSelect
                label="Who can approve?"
                options={WHO_CAN_APPROVE_OPTIONS}
                value={whoCanApprove}
                menuMode="inline"
                defaultOpen={step === 'who-can-approve'}
                onChange={(v) => {
                  setWhoCanApprove(v)
                  // Picking "Specific persons" continues to the team-member step of the flow.
                  if (v === 'Specific persons' && step === 'who-can-approve') navigate('/bills/list/bill-authorization-choose-team-member-dropdown-open')
                }}
              />
              {whoCanApprove === 'Specific persons' && (
                <KitSelect
                  label="Choose team member"
                  placeholder="Select team member"
                  options={TEAM_MEMBER_OPTIONS}
                  value={member}
                  onChange={setMember}
                  menuMode="inline"
                  defaultOpen={step === 'choose-team-member'}
                />
              )}
              {whoCanApprove === 'Role' && (
                <KitSelect label="Choose role" placeholder="Select role" options={APPROVER_ROLE_OPTIONS} value={role} onChange={setRole} menuMode="inline" />
              )}
            </div>
          </Card>

          <HdsButton variant="primary" fullWidth disabled={!canSave} onClick={() => navigate('/bills')}>
            Save
          </HdsButton>
        </div>
      </div>
    </div>
  )
}
