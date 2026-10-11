import { useLocation } from 'react-router-dom'
import AppShell from '../../components/layout/AppShell'

// Every destination outside multi-business access management in this prototype lands here. The title is taken from the URL
// (e.g. /payments/send-money → "Send money").
function titleFromPath(pathname: string) {
  const segment = pathname.split('/').filter(Boolean).pop()
  if (!segment) return 'Coming soon'
  const words = segment.replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export default function EmptyScreen() {
  const { pathname } = useLocation()

  return (
    <AppShell>
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex max-w-sm flex-col items-center gap-2 text-center">
          <p className="font-heading text-xl font-medium text-text-primary">{titleFromPath(pathname)}</p>
          <p className="text-sm text-text-quaternary">
            There&rsquo;s nothing here yet in this prototype.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
