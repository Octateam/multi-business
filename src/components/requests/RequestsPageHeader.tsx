import { useState } from 'react'
import Button from '../ui/Button'
import SubmitExpenseModal from './SubmitExpenseModal'
import plusIcon from '../../assets/icons/dashboard-submit-expense-icon.svg'

export default function RequestsPageHeader({ initialSubmitOpen = false }: { initialSubmitOpen?: boolean } = {}) {
  const [showSubmitExpense, setShowSubmitExpense] = useState(initialSubmitOpen)

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-col items-start gap-2">
        <h1 className="font-heading text-2xl font-semibold tracking-[-0.24px] text-black">Requests</h1>
        <p className="font-heading text-base text-[#70707d]">
          Manage and track requests submitted by your team
        </p>
      </div>
      <Button
        variant="primary"
        size="md"
        icon={<img src={plusIcon} alt="" className="size-4" />}
        onClick={() => setShowSubmitExpense(true)}
      >
        Submit expense
      </Button>

      {showSubmitExpense && <SubmitExpenseModal onClose={() => setShowSubmitExpense(false)} />}
    </div>
  )
}
