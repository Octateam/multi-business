import AppShell from '../../components/layout/AppShell'
import RequestsPageHeader from '../../components/requests/RequestsPageHeader'
import ExpenseOverview from '../../components/requests/ExpenseOverview'
import { emptyStatTiles, emptyExpenseCategories } from '../../data/requests'
import emptyInvoiceIcon from '../../assets/icons/dashboard-empty-invoice.svg'

export default function DashboardEmpty() {
  return (
    <AppShell>
      <main className="relative flex h-full w-full flex-col items-start gap-8 pb-10 pt-10">
        <RequestsPageHeader />
        <ExpenseOverview
          total="$0.00"
          newRequestsLabel={null}
          categories={emptyExpenseCategories}
          statTiles={emptyStatTiles}
        />
        <div className="flex flex-1 w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center rounded-pill bg-[#f2f2f2] p-[18px]">
              <img src={emptyInvoiceIcon} alt="" className="h-[27px] w-[22px]" />
            </div>
            <div className="flex w-[440px] flex-col items-center gap-1">
              <p className="font-heading text-xl font-medium tracking-[-0.2px] text-black">
                No requests yet
              </p>
              <p className="text-center text-sm text-[#555354]">
                Need a supplier paid, or spent your own money on something? Start a request and
                we&rsquo;ll route it for approval.
              </p>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
