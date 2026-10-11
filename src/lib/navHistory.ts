import { useCallback, useState } from 'react'
import { useNavigate, type To } from 'react-router-dom'

/**
 * Step history for multi-step drawers. Every forward move pushes onto a stack, so Back always
 * returns to the exact step the user came from (even in flows with several paths into a step).
 * Field state lives outside the stack, so going back never clears what the user already entered.
 */
export function useStepHistory<S>(initial: S | (() => S)) {
  const [stack, setStack] = useState<S[]>(() => [typeof initial === 'function' ? (initial as () => S)() : initial])
  const step = stack[stack.length - 1]
  /** Move forward to a step, remembering the current one. */
  const go = useCallback((next: S) => setStack((s) => (s[s.length - 1] === next ? s : [...s, next])), [])
  /** Swap the current step without adding a history entry (e.g. loading → result). */
  const replace = useCallback((next: S) => setStack((s) => [...s.slice(0, -1), next]), [])
  /** Start a fresh history on a step (e.g. when the drawer is (re)opened). */
  const reset = useCallback((next: S) => setStack([next]), [])
  const canGoBack = stack.length > 1
  /** Pop to the previous step. Returns false when there is no earlier step inside the drawer. */
  const back = useCallback(() => {
    if (stack.length <= 1) return false
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
    return true
  }, [stack.length])
  return { step, go, replace, reset, back, canGoBack }
}

/** True when the browser history has an earlier entry inside this app (React Router stores `idx`). */
export function hasInAppHistory() {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  return typeof idx === 'number' && idx > 0
}

/**
 * Back for route-level screens: return to whichever screen led here (navigate(-1)) when there is
 * in-app history, otherwise fall back to a sensible parent route.
 */
export function useGoBack(fallback: To) {
  const navigate = useNavigate()
  return useCallback(() => {
    if (hasInAppHistory()) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [navigate, fallback])
}
