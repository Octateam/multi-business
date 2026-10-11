import { lazy, Suspense, useState, type ComponentType } from 'react'
import { Link, Routes, Route } from 'react-router-dom'
import { ROUTES } from './routes'
import ScreenIndex, { ScreenIndexList } from './pages/ScreenIndex'
import { BusinessProvider } from './context/BusinessContext'
import { SidebarProvider } from './context/SidebarContext'
import EmptyScreen from './pages/placeholder/EmptyScreen'

const modules = import.meta.glob('./pages/**/*.tsx')

// Lazy page components are created once per file and reused, so re-renders and hot updates swap a
// screen's code in place instead of remounting it. If the glob hands back a new loader (a file was
// added or re-added), the cache entry is rebuilt.
const pageCache = new Map<string, { loader: unknown; Page: ComponentType }>()

function MissingScreen() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-surface-2 text-center">
      <p className="text-sm font-semibold text-text-primary">This screen isn’t available yet</p>
      <p className="text-[13px] text-text-quaternary">It may still be being built. It will appear here automatically once it exists.</p>
      <Link to="/" className="mt-2 text-[13px] font-semibold text-[#004b87] hover:underline">
        Go home
      </Link>
    </div>
  )
}

function lazyPage(component: string): ComponentType {
  const key = `./pages/${component}.tsx`
  const loader = modules[key]
  if (!loader) return MissingScreen
  const cached = pageCache.get(key)
  if (cached && cached.loader === loader) return cached.Page
  const Page = lazy(loader as () => Promise<{ default: ComponentType }>)
  pageCache.set(key, { loader, Page })
  return Page
}

// A floating action button that expands in place into a scrollable panel of every
// screen in the prototype, rather than navigating to a separate page — closing it
// (or picking a screen) returns you to exactly where you were.
function PrototypeMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-[#111927]/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex w-[420px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border-disabled bg-white shadow-2xl">
          <div className="flex shrink-0 items-center justify-between border-b border-border-disabled px-5 py-4">
            <div>
              <p className="font-heading text-base font-semibold text-text-primary">All screens</p>
              <p className="text-xs text-text-quaternary">{ROUTES.length} screens in this prototype</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="flex size-8 items-center justify-center rounded-full text-text-quaternary hover:bg-surface-2 hover:text-text-primary"
            >
              ✕
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto px-5 py-5">
            <ScreenIndexList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 rounded-pill bg-bg-inverted px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-black"
      >
        {open ? 'Close' : 'All screens'}
      </button>
    </>
  )
}

export default function App() {
  return (
    <BusinessProvider>
      <SidebarProvider>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center text-text-quaternary">Loading…</div>}>
          <Routes>
            <Route path="/screens" element={<ScreenIndex />} />
            {ROUTES.map((route) => {
              const Page = lazyPage(route.component)
              return <Route key={route.path} path={route.path} element={<Page />} />
            })}
            {/* Only multi-business access management has content; every other tab opens an empty screen. */}
            <Route path="*" element={<EmptyScreen />} />
          </Routes>
        </Suspense>
        <PrototypeMenu />
      </SidebarProvider>
    </BusinessProvider>
  )
}
