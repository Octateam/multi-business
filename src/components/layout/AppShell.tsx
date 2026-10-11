import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-2">
      <Sidebar />
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <TopBar />
        <div data-app-scroll className="flex-1 overflow-y-auto overflow-x-auto">
          {/* Content column: a fixed 1071px wide, with 91px margins left and right (the same margins as the
              top bar). On wider viewports, or with the sidebar collapsed, it stays 1071px and centres. */}
          <div data-content-column className="mx-auto box-content h-full w-[1071px] overflow-x-clip px-[91px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
