import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Home from '../../home/Home'
import { LinkRequestSentToast } from '../shared'

// Figma node 46940:236349 ("Link 04 — Request sent"). Unlike the other 7
// states, this one is NOT a modal — the modal has already closed and
// Figma shows a floating success toast (node 46940:236753 "Alert") over
// the plain Home dashboard. Implemented by reusing the real Home page and
// layering the toast on top, rather than forcing it into the modal shell.
export default function RequestSent() {
  const navigate = useNavigate()
  const location = useLocation()
  const businessName = (location.state as { businessName?: string } | null)?.businessName ?? 'Bright Logistics Ltd'
  const [showToast, setShowToast] = useState(true)

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Home />
      {showToast && (
        <div className="fixed right-9 top-[108px] z-50">
          <LinkRequestSentToast
            businessName={businessName}
            onClose={() => {
              setShowToast(false)
              navigate('/businesses')
            }}
          />
        </div>
      )}
    </div>
  )
}
