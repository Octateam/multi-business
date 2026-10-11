import { createContext, useContext, useState, type ReactNode } from 'react'

type SidebarContextValue = {
  collapsed: boolean
  toggleCollapsed: () => void
  openGroups: Record<string, boolean>
  toggleGroup: (key: string) => void
}

const SidebarContext = createContext<SidebarContextValue | null>(null)

const DEFAULT_OPEN_GROUPS: Record<string, boolean> = {
  expenses: false,
  payments: false,
  collections: false,
  accounting: false,
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(DEFAULT_OPEN_GROUPS)

  const toggleCollapsed = () => setCollapsed((c) => !c)
  const toggleGroup = (key: string) =>
    setOpenGroups((groups) => ({ ...groups, [key]: !groups[key] }))

  return (
    <SidebarContext.Provider value={{ collapsed, toggleCollapsed, openGroups, toggleGroup }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext() {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return ctx
}
