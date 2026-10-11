import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode; resetKey: string }
type State = { error: Error | null; resetKey: string }

/*
 * Keeps the prototype "live" while it's being edited. Without this, any render error (a screen
 * mid-edit, a route added a moment before its file exists) unmounts the whole React tree and only a
 * manual reload brings it back. This boundary catches the error, shows a small notice, and clears
 * itself automatically on the next hot update, on navigation, or when switching versions.
 */
export default class RecoveryBoundary extends Component<Props, State> {
  state: State = { error: null, resetKey: this.props.resetKey }

  private offUpdate?: () => void

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.resetKey ? { error: null, resetKey: props.resetKey } : null
  }

  componentDidMount() {
    const hot = import.meta.hot
    if (!hot) return
    const retry = () => {
      if (this.state.error) this.setState({ error: null })
    }
    hot.on('vite:afterUpdate', retry)
    this.offUpdate = () => hot.off?.('vite:afterUpdate', retry)
  }

  componentWillUnmount() {
    this.offUpdate?.()
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[prototype] Screen failed to render; will retry on next update.', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#f5f6f8] p-6">
        <div className="flex w-[440px] max-w-full flex-col gap-3 rounded-2xl border border-[#e1e4e9] bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#111927]">
            <span className="size-2 animate-pulse rounded-full bg-[#f5a524]" />
            This screen is updating
          </p>
          <p className="text-[13px] text-[#6b7280]">It will reappear on its own as soon as the latest change lands. No need to reload.</p>
          <pre className="max-h-32 overflow-auto rounded-lg bg-[#f5f6f8] p-3 text-[11px] text-[#b4232e]">{this.state.error.message}</pre>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="rounded-lg bg-[#111927] px-3 py-2 text-[12px] font-semibold text-white hover:bg-black"
            >
              Try again now
            </button>
            <a href="/" className="rounded-lg px-3 py-2 text-[12px] font-semibold text-[#4b5563] hover:bg-[#f5f6f8]">
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
