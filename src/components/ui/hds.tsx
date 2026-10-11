/*
 * Hinstantt Design System (HDS) primitives.
 * Source of truth: Figma "Hinstantt Design system (HDS)" — file 5sbjyGVqYhZPnWSTIFdCXK
 * (Button 798:2, Input fields 798:3, Select 1588:5747, Checkbox 798:4, Radio 798:19, Toggle 1079:7,
 *  Badge 798:7, Toggle Segment 798:5, Search 1958:11, Date Picker 798:25, Alert, List Item, Note,
 *  Upload Box, Stepper, colour/size variables).
 * Colour values below are the resolved HDS tokens, named in comments, so screens stay on-system.
 */
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type RefObject,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import uploadIcon from '../../assets/icons/hds-upload-icon.svg'
import uploadFileIcon from '../../assets/icons/hds-upload-file.svg'
import uploadRemoveIcon from '../../assets/icons/hds-upload-remove.svg'

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/*  Button                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'secondary' | 'link' | 'primary-link' | 'destructive' | 'destructive-secondary' | 'destructive-link' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

// Size × shape — HDS: md 48 (rounded) / 44 (pill), sm 36, lg 56. Radius 8 (radius-md) or full.
const BTN_SIZE: Record<'default' | 'pill', Record<ButtonSize, string>> = {
  default: { sm: 'h-9 px-3.5 text-[13px]', md: 'h-12 px-[26px] text-sm', lg: 'h-14 px-8 text-base' },
  pill: { sm: 'h-9 px-3.5 text-[13px]', md: 'h-11 px-6 text-sm', lg: 'h-14 px-7 text-base' },
}
const BTN_ICON_ONLY: Record<ButtonSize, string> = { sm: 'size-9', md: 'size-11', lg: 'size-14' }
const BTN_VARIANT: Record<ButtonVariant, string> = {
  // bg-inverted #111927 → hover bg-brand-section_hover #003a68; disabled bg-disabled_subtle / text-disabled
  primary: 'bg-[#111927] text-white hover:bg-[#003a68] disabled:bg-[#f5f6f8] disabled:text-[#9aa1ac]',
  // bg-brand-secondary #eaf2f9 / text-brand_secondary #004b87 → hover bg-brand-secondary_hover #d1e3f3
  secondary: 'bg-[#eaf2f9] text-[#004b87] hover:bg-[#d1e3f3] disabled:bg-[#f5f6f8] disabled:text-[#9aa1ac]',
  link: '!h-auto !px-0 text-[#004b87] hover:text-[#004378] hover:underline underline-offset-4 disabled:text-[#9aa1ac]',
  'primary-link': '!h-auto !px-0 text-[#111927] hover:underline underline-offset-4 disabled:text-[#9aa1ac]',
  destructive: 'bg-[#d92836] text-white hover:bg-[#b4232e] disabled:bg-[#edeff2] disabled:text-[#9aa1ac]',
  'destructive-secondary': 'bg-[#fde8ea] text-[#b4232e] hover:bg-[#fbd5d9] disabled:bg-[#edeff2] disabled:text-[#9aa1ac]',
  'destructive-link': '!h-auto !px-0 text-[#b4232e] hover:underline underline-offset-4 disabled:text-[#9aa1ac]',
  // Not a separate HDS variant: quiet tertiary built from bg-secondary tokens, for toolbars.
  ghost: 'bg-[#f5f6f8] text-[#111927] hover:bg-[#edeff2] disabled:text-[#9aa1ac]',
}

export type HdsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: 'default' | 'pill'
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  iconOnly?: boolean
  fullWidth?: boolean
}

export const HdsButton = forwardRef<HTMLButtonElement, HdsButtonProps>(function HdsButton(
  { variant = 'primary', size = 'md', shape = 'default', loading, leadingIcon, trailingIcon, iconOnly, fullWidth, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  const spinnerColor = variant === 'primary' || variant === 'destructive' ? 'border-white/30 border-t-white' : variant.startsWith('destructive') ? 'border-[#b4232e]/25 border-t-[#b4232e]' : 'border-[#004b87]/25 border-t-[#004b87]'
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-150 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#004b87]/70 focus-visible:ring-offset-1',
        shape === 'pill' ? 'rounded-full' : 'rounded-lg',
        iconOnly ? BTN_ICON_ONLY[size] : BTN_SIZE[shape][size],
        BTN_VARIANT[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? <span className={cx('size-4 animate-spin rounded-full border-2', spinnerColor)} aria-hidden="true" /> : leadingIcon}
      {!iconOnly && children}
      {iconOnly && !loading && children}
      {!loading && trailingIcon}
    </button>
  )
})

/* ------------------------------------------------------------------ */
/*  Field shell (label · control · helper/error)                       */
/* ------------------------------------------------------------------ */

export function FieldShell({
  label,
  required,
  optional,
  helper,
  error,
  htmlFor,
  disabled,
  children,
  className,
  labelAction,
}: {
  label?: ReactNode
  required?: boolean
  optional?: boolean
  helper?: ReactNode
  error?: ReactNode
  htmlFor?: string
  disabled?: boolean
  children: ReactNode
  className?: string
  labelAction?: ReactNode
}) {
  return (
    <div className={cx('flex w-full flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={htmlFor} className={cx('text-sm font-medium leading-5', disabled ? 'text-[#9aa1ac]' : 'text-[#111927]')}>
            {label}
            {required && <span className="ml-0.5">*</span>}
            {optional && <span className="font-normal text-[#6b7280]"> (optional)</span>}
          </label>
          {labelAction}
        </div>
      )}
      {children}
      {error ? <p className="text-[11px] leading-4 text-[#b4232e]">{error}</p> : helper ? <p className="text-[11px] leading-4 text-[#6b7280]">{helper}</p> : null}
    </div>
  )
}

// Input row — HDS: 44px, radius 8, px 14 / py 12, bg-secondary #f5f6f8, 0.5px border-tertiary #edeff2;
// hover bg #edeff2 + border #e1e4e9; focus 1px border-brand #004b87; error 1px #b4232e; disabled bg #edeff2.
export const inputRowClass = (opts: { error?: boolean; disabled?: boolean; focus?: boolean } = {}) =>
  cx(
    'flex w-full items-center gap-2 rounded-lg px-3.5 text-sm leading-5 transition-colors duration-150',
    opts.disabled
      ? 'cursor-not-allowed border-[0.5px] border-[#e1e4e9] bg-[#edeff2] text-[#9aa1ac]'
      : opts.error
        ? 'border border-[#b4232e] bg-[#f5f6f8] text-[#111927]'
        : opts.focus
          ? 'border border-[#004b87] bg-[#f5f6f8] text-[#111927]'
          : 'border-[0.5px] border-[#edeff2] bg-[#f5f6f8] text-[#111927] hover:border-[#e1e4e9] hover:bg-[#edeff2] focus-within:border focus-within:border-[#004b87] focus-within:bg-[#f5f6f8]',
  )

/* ------------------------------------------------------------------ */
/*  Text input                                                         */
/* ------------------------------------------------------------------ */

export type HdsInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> & {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  optional?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  prefix?: ReactNode
  suffix?: ReactNode
  containerClassName?: string
  labelAction?: ReactNode
}

export const HdsInput = forwardRef<HTMLInputElement, HdsInputProps>(function HdsInput(
  { label, helper, error, optional, required, leadingIcon, trailingIcon, prefix, suffix, disabled, id, className, containerClassName, labelAction, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  return (
    <FieldShell label={label} required={required} optional={optional} helper={helper} error={error} htmlFor={inputId} disabled={disabled} className={containerClassName} labelAction={labelAction}>
      <div className={cx(inputRowClass({ error: !!error, disabled }), 'h-11')}>
        {leadingIcon && <span className="flex shrink-0 text-[#6b7280]">{leadingIcon}</span>}
        {prefix && <span className="shrink-0 text-[#6b7280]">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error || undefined}
          className={cx('min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none disabled:cursor-not-allowed disabled:text-[#9aa1ac]', className)}
          {...rest}
        />
        {suffix && <span className="shrink-0 text-[#6b7280]">{suffix}</span>}
        {trailingIcon && <span className="flex shrink-0 text-[#6b7280]">{trailingIcon}</span>}
      </div>
    </FieldShell>
  )
})

export type HdsTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  helper?: ReactNode
  error?: ReactNode
  optional?: boolean
  maxChars?: number
  containerClassName?: string
}

export const HdsTextarea = forwardRef<HTMLTextAreaElement, HdsTextareaProps>(function HdsTextarea(
  { label, helper, error, optional, required, disabled, id, className, containerClassName, maxChars, value, rows = 4, ...rest },
  ref,
) {
  const autoId = useId()
  const inputId = id ?? autoId
  const count = typeof value === 'string' ? value.length : 0
  return (
    <FieldShell
      label={label}
      required={required}
      optional={optional}
      helper={maxChars ? <span className="flex justify-between"><span>{helper}</span><span className="tabular-nums">{count}/{maxChars}</span></span> : helper}
      error={error}
      htmlFor={inputId}
      disabled={disabled}
      className={containerClassName}
    >
      <div className={cx(inputRowClass({ error: !!error, disabled }), 'items-start py-3')}>
        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          required={required}
          value={value}
          maxLength={maxChars}
          aria-invalid={!!error || undefined}
          className={cx('min-h-[72px] w-full resize-none bg-transparent text-sm leading-5 text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none', className)}
          {...rest}
        />
      </div>
    </FieldShell>
  )
})

/* ------------------------------------------------------------------ */
/*  Dropdown menu + Select                                             */
/* ------------------------------------------------------------------ */

export type SelectOption = {
  value: string
  label: string
  icon?: ReactNode
  meta?: ReactNode
  description?: string
  disabled?: boolean
  group?: string
}

function useDismiss(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && onClose()
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, onClose])
  return ref
}

export const Chevron = ({ open, className }: { open?: boolean; className?: string }) => (
  <svg viewBox="0 0 16 16" className={cx('size-4 shrink-0 transition-transform duration-200', open && 'rotate-180', className)} fill="none" aria-hidden="true">
    <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const Tick = () => (
  <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden="true">
    <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
export const SearchGlyph = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" className={cx('shrink-0', className)} fill="none" aria-hidden="true">
    <circle cx="7.25" cy="7.25" r="4.75" stroke="currentColor" strokeWidth="1.4" />
    <path d="m13.5 13.5-2.7-2.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

// _Dropdown Menu — HDS: bg-inverted #111927, radius 8, padding 6, gap 2, shadow card. Options 40px, radius 10,
// px 14 py 10, 14px white; hover bg-dropdown_hover #4b5563; selected = semibold + tick; meta text #9aa1ac 11px.
export function DropdownMenu({
  options,
  value,
  multiple,
  values,
  onSelect,
  searchable,
  searchPlaceholder = 'Search',
  footer,
  className,
  emptyTitle = 'No results found',
  emptyHint = 'Try a different search term',
  maxHeight = 280,
}: {
  options: SelectOption[]
  value?: string | null
  multiple?: boolean
  values?: string[]
  onSelect: (value: string) => void
  searchable?: boolean
  searchPlaceholder?: string
  footer?: ReactNode
  className?: string
  emptyTitle?: string
  emptyHint?: string
  maxHeight?: number
}) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (searchable) requestAnimationFrame(() => searchRef.current?.focus())
  }, [searchable])
  const q = query.trim().toLowerCase()
  const filtered = useMemo(() => (q ? options.filter((o) => `${o.label} ${o.description ?? ''} ${o.value}`.toLowerCase().includes(q)) : options), [options, q])
  const isSelected = (v: string) => (multiple ? !!values?.includes(v) : v === value)
  let lastGroup: string | undefined

  return (
    <div
      role="listbox"
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setActive((i) => Math.min(i + 1, filtered.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setActive((i) => Math.max(i - 1, 0))
        } else if (e.key === 'Enter' && filtered[active]) {
          e.preventDefault()
          onSelect(filtered[active].value)
        }
      }}
      className={cx('flex w-full animate-[popIn_140ms_ease-out] flex-col gap-0.5 rounded-lg bg-[#111927] p-1.5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_2px_8px_rgba(16,24,40,0.05)]', className)}
    >
      {searchable && (
        <label className="mb-0.5 flex h-9 items-center gap-2 rounded-lg border-[0.5px] border-[#e1e4e9] bg-[#4b5563] px-3.5 focus-within:border focus-within:border-[#004b87]">
          <SearchGlyph className="size-4 text-[#9aa1ac]" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-xs text-white placeholder:text-[#9aa1ac] focus:outline-none"
          />
        </label>
      )}
      <div className="flex flex-col gap-0.5 overflow-y-auto" style={{ maxHeight }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col gap-0.5 px-3.5 py-2.5">
            <p className="text-sm font-medium text-white">{emptyTitle}</p>
            <p className="text-[11px] text-[#9aa1ac]">{emptyHint}</p>
          </div>
        ) : (
          filtered.map((o, i) => {
            const sel = isSelected(o.value)
            const header = o.group && o.group !== lastGroup ? o.group : null
            lastGroup = o.group
            return (
              <div key={o.value} className="flex flex-col gap-0.5">
                {header && <p className="px-3.5 pb-0.5 pt-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-[#9aa1ac]">{header}</p>}
                <button
                  type="button"
                  role="option"
                  aria-selected={sel}
                  disabled={o.disabled}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => onSelect(o.value)}
                  className={cx(
                    'flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3.5 py-2.5 text-left text-sm leading-5 text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                    i === active ? 'bg-[#4b5563]' : 'hover:bg-[#4b5563]',
                  )}
                >
                  {multiple && (
                    <span className={cx('flex size-4 shrink-0 items-center justify-center rounded border', sel ? 'border-white bg-white text-[#111927]' : 'border-white/40')}>
                      {sel && <Tick />}
                    </span>
                  )}
                  {o.icon && <span className="flex shrink-0 items-center">{o.icon}</span>}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className={cx('truncate', sel && !multiple && 'font-semibold')}>{o.label}</span>
                    {o.description && <span className="truncate text-[11px] text-[#9aa1ac]">{o.description}</span>}
                  </span>
                  {o.meta && <span className="shrink-0 text-[11px] text-[#9aa1ac]">{o.meta}</span>}
                  {sel && !multiple && <Tick />}
                </button>
              </div>
            )
          })
        )}
      </div>
      {footer && <div className="mt-0.5 border-t border-white/10 pt-1">{footer}</div>}
    </div>
  )
}

export type HdsSelectProps = {
  label?: ReactNode
  placeholder?: string
  options: SelectOption[]
  value: string | null
  onChange: (value: string) => void
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  optional?: boolean
  disabled?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  leadingIcon?: ReactNode
  className?: string
  /** 'overlay' floats the menu over content (default); 'inline' pushes content down like the HDS Open state. */
  menuMode?: 'overlay' | 'inline'
  renderValue?: (option: SelectOption) => ReactNode
  size?: 'md' | 'sm'
}

// Select — HDS: trigger is the Input row (44px) with chevron; Open state = brand border + _Dropdown Menu below.
export function HdsSelect({
  label,
  placeholder = 'Select…',
  options,
  value,
  onChange,
  helper,
  error,
  required,
  optional,
  disabled,
  searchable,
  searchPlaceholder,
  leadingIcon,
  className,
  menuMode = 'overlay',
  renderValue,
  size = 'md',
}: HdsSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  const id = useId()
  const selected = options.find((o) => o.value === value)
  const searchOn = searchable ?? options.length > 8
  return (
    <div ref={ref} className={cx('relative w-full', className)}>
      <FieldShell label={label} required={required} optional={optional} helper={!open ? helper : undefined} error={!open ? error : undefined} htmlFor={id} disabled={disabled}>
        <div className="relative">
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className={cx(inputRowClass({ error: !!error, disabled, focus: open }), size === 'sm' ? 'h-9' : 'h-11', 'text-left')}
          >
            {(selected?.icon ?? leadingIcon) && <span className="flex shrink-0 items-center text-[#6b7280]">{selected?.icon ?? leadingIcon}</span>}
            <span className={cx('min-w-0 flex-1 truncate', selected ? 'text-[#111927]' : 'text-[#9aa1ac]', disabled && 'text-[#9aa1ac]')}>
              {selected ? (renderValue ? renderValue(selected) : selected.label) : placeholder}
            </span>
            {/* Disabled = a fixed value: no chevron, since there's nothing to open. */}
            {!disabled && <Chevron open={open} className={open ? 'text-[#004b87]' : 'text-[#6b7280]'} />}
          </button>
          {open && menuMode === 'overlay' && (
            <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40">
              <DropdownMenu
                options={options}
                value={value}
                searchable={searchOn}
                searchPlaceholder={searchPlaceholder}
                onSelect={(v) => {
                  onChange(v)
                  setOpen(false)
                }}
              />
            </div>
          )}
        </div>
        {open && menuMode === 'inline' && (
          <DropdownMenu
            options={options}
            value={value}
            searchable={searchOn}
            searchPlaceholder={searchPlaceholder}
            onSelect={(v) => {
              onChange(v)
              setOpen(false)
            }}
          />
        )}
      </FieldShell>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Checkbox · Radio · Switch                                          */
/* ------------------------------------------------------------------ */

export function HdsCheckbox({
  checked,
  indeterminate,
  onChange,
  label,
  description,
  size = 'sm',
  disabled,
  className,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}) {
  const on = checked || indeterminate
  const box = (
    <span
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled || undefined}
      tabIndex={label ? -1 : 0}
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) onChange(!checked)
      }}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
          e.preventDefault()
          onChange(!checked)
        }
      }}
      className={cx(
        'flex shrink-0 cursor-pointer items-center justify-center border transition-colors',
        size === 'md' ? 'size-5 rounded-[5px]' : 'size-4 rounded',
        disabled ? 'cursor-not-allowed border-[#cbd0d8] bg-[#f5f6f8]' : on ? 'border-[#111927] bg-[#111927] text-white hover:bg-[#2a2f38]' : 'border-[#cbd0d8] bg-white hover:bg-[#f5f6f8]',
      )}
    >
      {checked && !indeterminate && (
        <svg viewBox="0 0 16 16" className="size-3" fill="none" aria-hidden="true">
          <path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {indeterminate && <span className="h-0.5 w-2 rounded bg-white" />}
    </span>
  )
  if (!label) return box
  return (
    <label className={cx('flex cursor-pointer items-start', size === 'md' ? 'gap-2.5' : 'gap-2', disabled && 'cursor-not-allowed', className)} onClick={() => !disabled && onChange(!checked)}>
      <span className="pt-0.5">{box}</span>
      <span className="flex flex-col">
        <span className={cx('font-semibold text-[#111927]', size === 'md' ? 'text-sm' : 'text-[13px]')}>{label}</span>
        {description && <span className="text-xs text-[#6b7280]">{description}</span>}
      </span>
    </label>
  )
}

export function HdsRadio({
  checked,
  onChange,
  label,
  description,
  size = 'sm',
  disabled,
  className,
}: {
  checked: boolean
  onChange: () => void
  label?: ReactNode
  description?: ReactNode
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}) {
  return (
    <label className={cx('flex cursor-pointer items-start', size === 'md' ? 'gap-2.5' : 'gap-2', disabled && 'cursor-not-allowed', className)}>
      <input type="radio" checked={checked} disabled={disabled} onChange={onChange} className="peer sr-only" />
      <span
        className={cx(
          'mt-0.5 flex shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#004b87]',
          size === 'md' ? 'size-5' : 'size-4',
          disabled ? 'border-[#cbd0d8] bg-[#f5f6f8]' : checked ? 'border-[#111927] bg-[#111927] hover:bg-[#2a2f38]' : 'border-[#cbd0d8] bg-white hover:bg-[#f5f6f8]',
        )}
      >
        {checked && <span className={cx('rounded-full bg-white', size === 'md' ? 'size-2' : 'size-1.5')} />}
      </span>
      {(label || description) && (
        <span className="flex flex-col">
          {label && <span className={cx('font-semibold text-[#111927]', size === 'md' ? 'text-sm' : 'text-[13px]')}>{label}</span>}
          {description && <span className="text-xs text-[#6b7280]">{description}</span>}
        </span>
      )}
    </label>
  )
}

// Switch — HDS Toggle: 32×18 pill, off bg-tertiary #e1e4e9, on bg-inverted #111927, white knob.
export function HdsSwitch({ checked, onChange, label, description, disabled, card, className }: { checked: boolean; onChange: (v: boolean) => void; label?: ReactNode; description?: ReactNode; disabled?: boolean; card?: boolean; className?: string }) {
  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx('relative h-[18px] w-8 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-50', checked ? 'bg-[#111927]' : 'bg-[#e1e4e9]')}
    >
      <span className={cx('absolute left-0 top-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200', checked ? 'translate-x-[16px]' : 'translate-x-0.5')} />
    </button>
  )
  if (!label) return control
  return (
    <div className={cx('flex items-center justify-between gap-3', card ? 'rounded-lg border border-[#edeff2] bg-[#f5f6f8] px-4 py-3.5' : 'py-3', className)}>
      <span className="flex flex-col">
        <span className="text-sm font-medium text-[#111927]">{label}</span>
        {description && <span className="text-xs text-[#6b7280]">{description}</span>}
      </span>
      {control}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Badge                                                              */
/* ------------------------------------------------------------------ */

export type BadgeColor = 'green' | 'grey' | 'red' | 'amber' | 'dark' | 'info' | 'navy'
const BADGE: Record<BadgeColor, { filled: string; outline: string; text: string; dot: string }> = {
  green: { filled: 'bg-[#e6f7f1] text-[#077155]', outline: 'border border-[#077155] text-[#077155]', text: 'text-[#077155]', dot: 'bg-[#077155]' },
  grey: { filled: 'bg-[#edeff2] text-[#4b5563]', outline: 'border border-[#e1e4e9] text-[#111927]', text: 'text-[#4b5563]', dot: 'bg-[#4b5563]' },
  red: { filled: 'bg-[#fde8ea] text-[#b4232e]', outline: 'border border-[#b4232e] text-[#b4232e]', text: 'text-[#b4232e]', dot: 'bg-[#b4232e]' },
  amber: { filled: 'bg-[#fff3d6] text-[#8a6300]', outline: 'border border-[#8a6300] text-[#8a6300]', text: 'text-[#8a6300]', dot: 'bg-[#8a6300]' },
  dark: { filled: 'bg-[#001521] text-white', outline: 'border border-[#001521] text-[#001521]', text: 'text-[#001521]', dot: 'bg-white' },
  info: { filled: 'bg-[#004b87] text-white', outline: 'border border-[#004b87] text-[#004b87]', text: 'text-[#004b87]', dot: 'bg-white' },
  navy: { filled: 'bg-[#eaf2f9] text-[#004b87]', outline: 'border border-[#004b87] text-[#004b87]', text: 'text-[#004b87]', dot: 'bg-[#004b87]' },
}
export function HdsBadge({ color = 'grey', variant = 'filled', size = 'md', dot, icon, children, className }: { color?: BadgeColor; variant?: 'filled' | 'outline' | 'text'; size?: 'sm' | 'md' | 'lg'; dot?: boolean; icon?: ReactNode; children: ReactNode; className?: string }) {
  const s = BADGE[color]
  const dotColor = variant !== 'filled' && (color === 'dark' || color === 'info') ? (color === 'dark' ? 'bg-[#001521]' : 'bg-[#004b87]') : s.dot
  return (
    <span
      className={cx(
        'inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium',
        size === 'sm' ? 'h-5 px-2 text-[10px]' : size === 'lg' ? 'h-7 px-3 text-xs' : 'h-6 px-2.5 text-[11px]',
        variant === 'text' ? cx('!px-0', s.text) : variant === 'outline' ? s.outline : s.filled,
        className,
      )}
    >
      {dot && <span className={cx('size-1.5 rounded-full', dotColor)} />}
      {icon}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Toggle segment · Search                                            */
/* ------------------------------------------------------------------ */

// Toggle Segment — HDS: bg-secondary #f5f6f8 pill, p-4; items 36px pill px-18; active bg-inverted + inverted text.
export function HdsToggleSegment<T extends string>({ options, value, onChange, size = 'md', className }: { options: { value: T; label: ReactNode }[]; value: T; onChange: (v: T) => void; size?: 'sm' | 'md'; className?: string }) {
  return (
    <div role="tablist" className={cx('inline-flex items-center rounded-full bg-[#f5f6f8] p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'whitespace-nowrap rounded-full transition-colors duration-200',
              size === 'sm' ? 'h-7 px-3 text-xs' : 'h-9 px-[18px] text-sm',
              active ? 'bg-[#111927] text-[#f5f6f8]' : 'text-[#4b5563] hover:text-[#111927]',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// Search — HDS: 36px, radius 8, px 14, bg-secondary, 0.5px border #e1e4e9, focus border-brand; 12px text; clear when typing.
export function HdsSearch({ value, onChange, placeholder = 'Search', shortcut, className, autoFocus, inputRef }: { value: string; onChange: (v: string) => void; placeholder?: string; shortcut?: string; className?: string; autoFocus?: boolean; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <label className={cx('flex h-9 items-center gap-2 rounded-lg border-[0.5px] border-[#e1e4e9] bg-[#f5f6f8] px-3.5 transition-colors focus-within:border focus-within:border-[#004b87]', className)}>
      <SearchGlyph className="size-4 text-[#6b7280]" />
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-xs text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none"
      />
      {value ? (
        <button type="button" aria-label="Clear search" onClick={() => onChange('')} className="flex size-4 items-center justify-center rounded-full bg-[#9aa1ac] text-white hover:bg-[#6b7280]">
          <svg viewBox="0 0 16 16" className="size-2.5" fill="none" aria-hidden="true">
            <path d="m4.5 4.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : shortcut ? (
        <kbd className="rounded-md border border-[#cbd0d8] bg-white px-1.5 py-0.5 font-sans text-[10px] text-[#6b7280]">{shortcut}</kbd>
      ) : null}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/*  Action menu (button + dark dropdown of actions)                    */
/* ------------------------------------------------------------------ */

export type ActionItem = { label: string; icon?: ReactNode; onSelect: () => void; tone?: 'default' | 'danger'; description?: string; disabled?: boolean }

// For "Actions" style buttons: opens on click only, dark HDS menu, danger items in red-300 on dark.
export function HdsActionMenu({ items, trigger, align = 'right', width = 240, theme = 'dark' }: { items: ActionItem[]; trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; align?: 'left' | 'right'; width?: number; /** 'light' = the white row-actions menu used on tables (e.g. Bills 44840:253001). */ theme?: 'dark' | 'light' }) {
  const light = theme === 'light'
  const [open, setOpen] = useState(false)
  const ref = useDismiss(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div role="menu" style={{ width }} className={cx('absolute top-[calc(100%+6px)] z-40 flex animate-[popIn_140ms_ease-out] flex-col gap-0.5 rounded-lg p-1.5', light ? 'border-[0.5px] border-[#edeff2] bg-white shadow-[0_8px_24px_-8px_rgba(16,24,40,0.14)]' : 'bg-[#111927] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-6px_rgba(16,24,40,0.25)]', align === 'right' ? 'right-0' : 'left-0')}>
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              role="menuitem"
              disabled={it.disabled}
              onClick={() => {
                setOpen(false)
                it.onSelect()
              }}
              className={cx(
                'flex w-full items-center text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                light ? 'min-h-8 gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium hover:bg-[#f5f6f8]' : 'min-h-10 gap-2.5 rounded-[10px] px-3.5 py-2.5 text-sm hover:bg-[#4b5563]',
                it.tone === 'danger' ? (light ? 'text-[#b4232e]' : 'text-[#f18d95]') : light ? 'text-[#4b5563] hover:text-[#111927]' : 'text-white',
              )}
            >
              {it.icon && <span className={cx('flex shrink-0 items-center justify-center', light ? 'size-3.5' : 'size-4 opacity-80')}>{it.icon}</span>}
              <span className="flex min-w-0 flex-col">
                <span>{it.label}</span>
                {it.description && <span className="text-[11px] text-[#9aa1ac]">{it.description}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Date picker                                                        */
/* ------------------------------------------------------------------ */

// Date Picker — HDS page 798:25, component set "Date picker" (Type=Single, View=Days 2030:73 /
// Months 2042:211475 / Years 2042:211601). Popover: bg-primary #fff, 1px #edeff2, radius 12, p 16/24,
// shadow 0 8 24 rgba(16,24,40,.10), 280px content. Header: chevrons #9aa1ac, month + year selectors
// Inter Semi Bold 14 #4b5563 with carets (click → Months / Years view). Weekdays Mo–Su Inter Medium 12
// #4b5563. _Calendar day (517:88): 40×40 circle, 13px #111927; hover #f5f6f8; selected bg-brand #004b87 +
// white; today Medium + 4px #004b87 dot; outside month / disabled #9aa1ac. _Calendar option (2042:211474):
// 40px, radius 8, 13px; hover #f5f6f8; selected #004b87 white Medium.
// Values are 'DD/MM/YYYY' strings — what the bill forms already store.

const DP_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DP_WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const DP_WIDTH = 328

/** 'DD/MM/YYYY' (also D/M/YYYY, '-' or '.') → Date, or null when it isn't a real calendar date. */
export function parseHdsDate(v: string | Date | null | undefined): Date | null {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : new Date(v.getFullYear(), v.getMonth(), v.getDate())
  const m = v.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null
}

/** Date → 'DD/MM/YYYY'. */
export const formatHdsDate = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

const dpSame = (a: Date | null | undefined, b: Date | null | undefined) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const dpAddDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const dpAddMonths = (d: Date, n: number) => {
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1)
  return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate()))
}
const dpToday = () => {
  const n = new Date()
  return new Date(n.getFullYear(), n.getMonth(), n.getDate())
}
/** Typing mask: keeps digits, inserts the slashes → DD/MM/YYYY. */
const dpMask = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 8)
  return d.length > 4 ? `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}` : d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export const CalendarIcon = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="none" className={cx('shrink-0', className)} aria-hidden="true">
    <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M2.5 6.5h11M5.5 2v2.5M10.5 2v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)
const DpArrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden="true">
    {dir === 'left' ? <path d="M10 4.5v7L5 8l5-3.5Z" /> : <path d="M6 4.5v7L11 8 6 4.5Z" />}
  </svg>
)
const DpCaret = () => (
  <svg viewBox="0 0 12 12" className="size-3 text-[#9aa1ac]" fill="currentColor" aria-hidden="true">
    <path d="M3 4.5h6L6 8 3 4.5Z" />
  </svg>
)

export type HdsCalendarProps = {
  value: Date | null
  onSelect: (d: Date) => void
  min?: Date | null
  max?: Date | null
  /** Moves keyboard focus into the day grid on mount (opened from the icon / ArrowDown). */
  autoFocus?: boolean
  onEscape?: () => void
  onTab?: () => void
  className?: string
}

/** The HDS calendar panel (Type=Single). Days / Months / Years views, keyboard navigable. */
export function HdsCalendar({ value, onSelect, min, max, autoFocus, onEscape, onTab, className }: HdsCalendarProps) {
  const today = useMemo(dpToday, [])
  const initial = value ?? (min && today < min ? min : max && today > max ? max : today)
  const [view, setView] = useState<'days' | 'months' | 'years'>('days')
  const [cursor, setCursor] = useState(initial) // focused day; its month is the visible month
  const [gridFocus, setGridFocus] = useState(!!autoFocus)
  const gridRef = useRef<HTMLDivElement>(null)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const outOfRange = (d: Date) => (!!min && d < min) || (!!max && d > max)

  useEffect(() => {
    if (autoFocus) setGridFocus(true)
  }, [autoFocus])
  // Typing a full date into the field moves the calendar to it.
  const valueTime = value?.getTime()
  useEffect(() => {
    if (valueTime !== undefined) setCursor(new Date(valueTime))
  }, [valueTime])
  useEffect(() => {
    if (!gridFocus || view !== 'days') return
    gridRef.current?.querySelector<HTMLButtonElement>('[data-focus="true"]')?.focus({ preventScroll: true })
  }, [cursor, gridFocus, view])

  // 6-week grid, Monday first.
  const first = new Date(year, month, 1)
  const lead = (first.getDay() + 6) % 7
  const days = Array.from({ length: 42 }, (_, i) => new Date(year, month, 1 - lead + i))
  const yearStart = year - ((((year - 2017) % 12) + 12) % 12)

  const step = (dir: -1 | 1) => {
    if (view === 'days') setCursor((c) => dpAddMonths(c, dir))
    else if (view === 'months') setCursor((c) => dpAddMonths(c, dir * 12))
    else setCursor((c) => dpAddMonths(c, dir * 144))
  }
  const pick = (d: Date) => {
    if (!outOfRange(d)) onSelect(d)
  }
  const onGridKey = (e: ReactKeyboardEvent) => {
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => dpAddDays(cursor, -1),
      ArrowRight: () => dpAddDays(cursor, 1),
      ArrowUp: () => dpAddDays(cursor, -7),
      ArrowDown: () => dpAddDays(cursor, 7),
      PageUp: () => dpAddMonths(cursor, e.shiftKey ? -12 : -1),
      PageDown: () => dpAddMonths(cursor, e.shiftKey ? 12 : 1),
      Home: () => dpAddDays(cursor, -((cursor.getDay() + 6) % 7)),
      End: () => dpAddDays(cursor, 6 - ((cursor.getDay() + 6) % 7)),
    }
    if (moves[e.key]) {
      e.preventDefault()
      setGridFocus(true)
      setCursor(moves[e.key]())
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      pick(cursor)
    }
  }
  const onPanelKey = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation()
      onEscape?.()
    } else if (e.key === 'Tab' && onTab) {
      e.preventDefault()
      onTab()
    }
  }

  const navBtn = 'flex size-6 items-center justify-center rounded-md text-[#9aa1ac] transition-colors hover:bg-[#f5f6f8] hover:text-[#4b5563] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]/60'
  const headBtn = 'flex items-center gap-1 rounded-md px-1 text-sm font-semibold leading-[17px] text-[#4b5563] transition-colors hover:text-[#111927] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]/60'
  const optionCls = (sel: boolean, dis: boolean) =>
    cx(
      'flex h-10 items-center justify-center rounded-lg text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004b87]/60',
      sel ? 'bg-[#004b87] font-medium text-white' : dis ? 'cursor-not-allowed text-[#9aa1ac] opacity-60' : 'text-[#111927] hover:bg-[#f5f6f8]',
    )
  const prevLabel = view === 'days' ? 'Previous month' : view === 'months' ? 'Previous year' : 'Previous years'
  const nextLabel = view === 'days' ? 'Next month' : view === 'months' ? 'Next year' : 'Next years'

  return (
    <div
      role="dialog"
      aria-label="Choose date"
      onKeyDown={onPanelKey}
      className={cx('flex flex-col gap-3 rounded-xl border border-[#edeff2] bg-white px-6 py-4 shadow-[0_8px_24px_rgba(16,24,40,0.10)]', className)}
      style={{ width: DP_WIDTH }}
    >
      <div className="flex h-6 items-center justify-between gap-2">
        <button type="button" aria-label={prevLabel} onClick={() => step(-1)} className={navBtn}>
          <DpArrow dir="left" />
        </button>
        <div className="flex items-center gap-3" aria-live="polite">
          {view === 'days' && (
            <button type="button" className={headBtn} onClick={() => setView('months')} aria-label={`${DP_MONTHS[month]}, choose month`}>
              {DP_MONTHS[month]}
              <DpCaret />
            </button>
          )}
          {view !== 'years' ? (
            <button type="button" className={headBtn} onClick={() => setView('years')} aria-label={`${year}, choose year`}>
              {year}
              <DpCaret />
            </button>
          ) : (
            <span className="px-1 text-sm font-semibold leading-[17px] text-[#4b5563]">
              {yearStart} – {yearStart + 11}
            </span>
          )}
        </div>
        <button type="button" aria-label={nextLabel} onClick={() => step(1)} className={navBtn}>
          <DpArrow dir="right" />
        </button>
      </div>

      {view === 'days' && (
        <div className="flex flex-col">
          <div className="grid grid-cols-7" aria-hidden="true">
            {DP_WEEKDAYS.map((w) => (
              <span key={w} className="flex h-6 items-center justify-center text-xs font-medium text-[#4b5563]">
                {w}
              </span>
            ))}
          </div>
          <div ref={gridRef} role="grid" aria-label={`${DP_MONTHS[month]} ${year}`} className="grid grid-cols-7" onKeyDown={onGridKey}>
            {days.map((d) => {
              const outside = d.getMonth() !== month
              const sel = dpSame(d, value)
              const isToday = dpSame(d, today)
              const dis = outOfRange(d)
              const focus = dpSame(d, cursor)
              return (
                <button
                  key={d.getTime()}
                  type="button"
                  role="gridcell"
                  data-focus={focus}
                  data-date={formatHdsDate(d)}
                  tabIndex={focus ? 0 : -1}
                  aria-selected={sel}
                  aria-disabled={dis || undefined}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${d.getDate()} ${DP_MONTHS[d.getMonth()]} ${d.getFullYear()}`}
                  onClick={() => {
                    setCursor(d)
                    pick(d)
                  }}
                  onFocus={() => setGridFocus(true)}
                  className={cx(
                    'relative flex size-10 items-center justify-center rounded-full text-[13px] leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#004b87]/60',
                    sel
                      ? 'bg-[#004b87] text-white'
                      : dis
                        ? 'cursor-not-allowed text-[#9aa1ac] opacity-50'
                        : cx(outside ? 'text-[#9aa1ac]' : 'text-[#111927]', 'hover:bg-[#f5f6f8]'),
                    isToday && !sel && 'font-medium',
                  )}
                >
                  {d.getDate()}
                  {isToday && !sel && <span className="absolute bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-[#004b87]" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {view === 'months' && (
        <div className="grid grid-cols-3 gap-x-2 gap-y-[0.5rem] pt-1">
          {DP_MONTHS.map((m, i) => {
            const startOf = new Date(year, i, 1)
            const endOf = new Date(year, i + 1, 0)
            const dis = (!!min && endOf < min) || (!!max && startOf > max)
            const sel = !!value && value.getFullYear() === year && value.getMonth() === i
            return (
              <button
                key={m}
                type="button"
                disabled={dis}
                aria-pressed={sel}
                onClick={() => {
                  setCursor((c) => new Date(year, i, Math.min(c.getDate(), endOf.getDate())))
                  setView('days')
                }}
                className={optionCls(sel, dis)}
              >
                {m.slice(0, 3)}
              </button>
            )
          })}
        </div>
      )}

      {view === 'years' && (
        <div className="grid grid-cols-3 gap-x-2 gap-y-[0.5rem] pt-1">
          {Array.from({ length: 12 }, (_, i) => yearStart + i).map((y) => {
            const dis = (!!min && y < min.getFullYear()) || (!!max && y > max.getFullYear())
            const sel = !!value && value.getFullYear() === y
            return (
              <button
                key={y}
                type="button"
                disabled={dis}
                aria-pressed={sel}
                onClick={() => {
                  setCursor((c) => dpAddMonths(c, (y - c.getFullYear()) * 12))
                  setView('months')
                }}
                className={optionCls(sel, dis)}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Positions a body-portalled popover under (or, without room, above) an anchor; follows scroll/resize. */
function useAnchoredPosition(open: boolean, anchor: RefObject<HTMLElement | null>, pop: RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<{ top: number; left: number; placement: 'bottom' | 'top' } | null>(null)
  const update = useCallback(() => {
    const a = anchor.current
    const p = pop.current
    if (!a || !p) return
    const r = a.getBoundingClientRect()
    const h = p.offsetHeight
    const w = p.offsetWidth
    const gap = 6
    const below = window.innerHeight - r.bottom - gap
    const above = r.top - gap
    const placement = below < h + 8 && above > below ? 'top' : 'bottom'
    const top = placement === 'bottom' ? r.bottom + gap : Math.max(8, r.top - gap - h)
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - w - 8))
    setPos((prev) => (prev && prev.top === top && prev.left === left && prev.placement === placement ? prev : { top, left, placement }))
  }, [anchor, pop])
  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    update()
    // Panel height changes between Days / Months / Years views.
    const ro = typeof ResizeObserver !== 'undefined' && pop.current ? new ResizeObserver(update) : null
    if (ro && pop.current) ro.observe(pop.current)
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      ro?.disconnect()
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open, update, pop])
  return pos
}

export type HdsDatePickerProps = {
  label?: ReactNode
  /** 'DD/MM/YYYY' */
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  /** Earliest selectable date ('DD/MM/YYYY' or Date) — e.g. a due date can't precede the bill date. */
  min?: string | Date | null
  max?: string | Date | null
  helper?: ReactNode
  error?: ReactNode
  required?: boolean
  optional?: boolean
  disabled?: boolean
  /** Trailing glyph; defaults to the HDS calendar icon. */
  icon?: ReactNode
  /** Allow typing DD/MM/YYYY into the field (masked). Default true. */
  typeable?: boolean
  /** 'stacked' = HDS label above the input row; 'inset' = label-inside field box (bill review screens). */
  layout?: 'stacked' | 'inset'
  id?: string
  className?: string
  defaultOpen?: boolean
}

// Trigger = HDS Input row (Type=Icon trailing): 44px, radius 8, bg #f5f6f8, 0.5px #edeff2; open/focus
// 1px brand #004b87; error #b4232e. Click on the field or the icon opens the calendar popover.
export function HdsDatePicker({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  min,
  max,
  helper,
  error,
  required,
  optional,
  disabled,
  icon,
  typeable = true,
  layout = 'stacked',
  id,
  className,
  defaultOpen = false,
}: HdsDatePickerProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const [open, setOpen] = useState(defaultOpen && !disabled)
  const [focusGrid, setFocusGrid] = useState(false)
  const [touched, setTouched] = useState(false)
  const anchorRef = useRef<HTMLDivElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pos = useAnchoredPosition(open, anchorRef, popRef)
  const selected = parseHdsDate(value)
  const minD = parseHdsDate(min ?? null)
  const maxD = parseHdsDate(max ?? null)
  const interactive = !disabled && !!onChange

  const close = useCallback((refocus = false) => {
    setOpen(false)
    setFocusGrid(false)
    if (refocus) inputRef.current?.focus()
  }, [])
  const show = (grid: boolean) => {
    if (!interactive) return
    setFocusGrid(grid)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const down = (e: MouseEvent) => {
      const t = e.target as Node
      if (anchorRef.current?.contains(t) || popRef.current?.contains(t)) return
      close()
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && close(true)
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => {
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [open, close])

  const invalid = touched && !open && value.trim() !== '' && !selected ? 'Enter a valid date (DD/MM/YYYY)' : undefined
  const shownError = error ?? invalid
  const inset = layout === 'inset'

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || (e.key === 'Enter' && !open)) {
      e.preventDefault()
      if (open) popRef.current?.querySelector<HTMLButtonElement>('[role="gridcell"][data-focus="true"]')?.focus({ preventScroll: true })
      else show(true)
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      close()
    } else if (e.key === 'Tab' && open) {
      close()
    }
  }

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      value={value}
      disabled={disabled}
      placeholder={placeholder}
      readOnly={!onChange || !typeable}
      inputMode="numeric"
      autoComplete="off"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-invalid={!!shownError || undefined}
      aria-label={inset && typeof label === 'string' ? label : undefined}
      onClick={() => !open && show(false)}
      onKeyDown={onInputKey}
      onBlur={() => setTouched(true)}
      onChange={(e) => onChange?.(dpMask(e.target.value))}
      className={cx(
        'min-w-0 flex-1 bg-transparent text-sm text-[#111927] placeholder:text-[#9aa1ac] focus:outline-none disabled:cursor-not-allowed disabled:text-[#9aa1ac]',
        inset && 'font-medium placeholder:font-normal',
        interactive && 'cursor-pointer',
      )}
    />
  )
  const iconBtn = (
    <button
      type="button"
      tabIndex={-1}
      disabled={!interactive}
      aria-label={open ? 'Close calendar' : 'Open calendar'}
      onClick={() => (open ? close(true) : show(true))}
      className={cx('flex shrink-0 items-center', open ? 'text-[#004b87]' : 'text-[#6b7280]', !interactive && 'cursor-default')}
    >
      {icon ?? <CalendarIcon />}
    </button>
  )

  const popover =
    open &&
    createPortal(
      <div
        ref={popRef}
        className="fixed z-[1000]"
        style={{ top: pos?.top ?? 0, left: pos?.left ?? 0, opacity: pos ? 1 : 0, pointerEvents: pos ? undefined : 'none' }}
        data-placement={pos?.placement}
      >
        <HdsCalendar
          className="animate-[popIn_140ms_ease-out]"
          value={selected}
          min={minD}
          max={maxD}
          autoFocus={focusGrid}
          onSelect={(d) => {
            onChange?.(formatHdsDate(d))
            setTouched(false)
            close(true)
          }}
          onEscape={() => close(true)}
          onTab={() => close(true)}
        />
      </div>,
      document.body,
    )

  if (inset) {
    return (
      <div
        ref={anchorRef}
        className={cx(
          'flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg px-3.5 py-2.5 text-left transition-colors duration-150',
          shownError
            ? 'border border-[#b4232e] bg-[#f5f6f8]'
            : open
              ? 'border border-[#004b87] bg-[#f5f6f8]'
              : 'border-[0.5px] border-[#edeff2] bg-[#f5f6f8] hover:border-[#e1e4e9] hover:bg-[#edeff2] focus-within:border focus-within:border-[#004b87] focus-within:bg-[#f5f6f8]',
          className,
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget && !open) show(false)
        }}
      >
        {label && (
          <label htmlFor={inputId} className="text-xs text-[#6b7280]">
            {label}
          </label>
        )}
        <div className="flex w-full items-center gap-2">
          {input}
          {iconBtn}
        </div>
        {shownError && <p className="text-[11px] leading-4 text-[#b4232e]">{shownError}</p>}
        {popover}
      </div>
    )
  }

  return (
    <FieldShell label={label} required={required} optional={optional} helper={helper} error={shownError} htmlFor={inputId} disabled={disabled} className={className}>
      <div
        ref={anchorRef}
        className={cx(inputRowClass({ error: !!shownError, disabled, focus: open }), 'h-11', interactive && 'cursor-pointer')}
        onClick={(e) => {
          if (e.target === e.currentTarget && !open) {
            inputRef.current?.focus()
            show(false)
          }
        }}
      >
        {input}
        {iconBtn}
      </div>
      {popover}
    </FieldShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Alert · List Item · Note · Upload Box · Stepper                    */
/*  Figma HDS: Alert (Tone Amber/Red/Blue/Green), List Item (Style     */
/*  Plain/Card × Trailing None/Chevron/Value/Badge/Button), Note       */
/*  (title + icon bullet lines), Upload Box (Empty/Success), Stepper   */
/*  (Type=Minimal: Details / Review / Status).                          */
/* ------------------------------------------------------------------ */

export type AlertTone = 'blue' | 'amber' | 'red' | 'green'
const ALERT: Record<AlertTone, { bg: string; icon: string; title: string }> = {
  blue: { bg: 'bg-[#eaf2f9]', icon: 'text-[#004b87]', title: 'text-[#004b87]' },
  amber: { bg: 'bg-[#fff3d6]', icon: 'text-[#8a6300]', title: 'text-[#8a6300]' },
  red: { bg: 'bg-[#fde8ea]', icon: 'text-[#b4232e]', title: 'text-[#b4232e]' },
  green: { bg: 'bg-[#e6f7f1]', icon: 'text-[#077155]', title: 'text-[#077155]' },
}
const InfoGlyph = ({ className = 'size-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15a1 1 0 0 1-1-1v-4a1 1 0 1 1 2 0v4a1 1 0 0 1-1 1Zm0-8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
  </svg>
)

export function HdsAlert({ tone = 'blue', title, children, className }: { tone?: AlertTone; title?: ReactNode; children: ReactNode; className?: string }) {
  const t = ALERT[tone]
  return (
    <div role={tone === 'red' ? 'alert' : 'status'} className={cx('flex items-start gap-3 rounded-[10px] py-4 pl-4 pr-3.5', t.bg, className)}>
      <span className={cx('flex size-[18px] shrink-0 items-center justify-center', t.icon)}>
        <InfoGlyph />
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        {title && <p className={cx('text-[13px] font-semibold leading-5', t.title)}>{title}</p>}
        <div className="text-xs leading-5 text-[#4b5563]">{children}</div>
      </div>
    </div>
  )
}

export type ListItemTrailing = { type: 'none' } | { type: 'chevron' } | { type: 'value'; value: ReactNode; subtitle?: ReactNode } | { type: 'badge'; badge: ReactNode } | { type: 'node'; node: ReactNode }

export function HdsListItem({
  title,
  subtitle,
  leading,
  trailing = { type: 'none' },
  style = 'plain',
  reverse,
  onClick,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ListItemTrailing
  style?: 'plain' | 'card'
  /** Subtitle above the title (label → value rows). */
  reverse?: boolean
  onClick?: () => void
  className?: string
}) {
  const Tag = onClick ? 'button' : 'div'
  const text = (
    <span className={cx('flex min-w-0 flex-1 flex-col gap-0.5 text-left', reverse && 'flex-col-reverse')}>
      <span className={cx('break-words text-sm leading-5 text-[#111927]', reverse ? 'font-medium' : 'font-medium')}>{title}</span>
      {subtitle && <span className="text-xs leading-4 text-[#6b7280]">{subtitle}</span>}
    </span>
  )
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cx(
        'flex w-full items-center gap-3 text-left',
        style === 'card' ? 'rounded-xl border border-[#e1e4e9] bg-white p-4' : 'py-3',
        onClick && (style === 'card' ? 'transition-colors hover:border-[#004b87] hover:bg-[#f8fbfe]' : 'rounded-lg transition-colors hover:bg-[#f5f6f8]'),
        className,
      )}
    >
      {leading && <span className="flex shrink-0 items-center justify-center">{leading}</span>}
      {text}
      {trailing.type === 'chevron' && <Chevron className="size-4 -rotate-90 text-[#6b7280]" />}
      {trailing.type === 'value' && (
        <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <span className="text-sm font-semibold leading-5 tabular-nums text-[#111927]">{trailing.value}</span>
          {trailing.subtitle && <span className="text-[11px] leading-4 text-[#6b7280]">{trailing.subtitle}</span>}
        </span>
      )}
      {trailing.type === 'badge' && <span className="shrink-0">{trailing.badge}</span>}
      {trailing.type === 'node' && <span className="shrink-0">{trailing.node}</span>}
    </Tag>
  )
}

/** Round leading tile for List Item (HDS Avatar, Type=Icon). */
export const HdsIconTile = ({ children, size = 40 }: { children: ReactNode; size?: number }) => (
  <span className="flex shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] text-[#4b5563]" style={{ width: size, height: size }}>
    {children}
  </span>
)

export function HdsNote({ title, lines, collapsible, defaultOpen = true, className }: { title: ReactNode; lines: ReactNode[]; collapsible?: boolean; defaultOpen?: boolean; className?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  const shown = !collapsible || open
  const head = <p className="font-heading text-sm font-semibold leading-5 text-[#222121]">{title}</p>
  return (
    <div className={cx('flex flex-col rounded-xl bg-[#f5f6f8]', className)}>
      {collapsible ? (
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-4 text-left">
          {head}
          <Chevron open={open} className="size-4 shrink-0 text-[#6b7280]" />
        </button>
      ) : (
        <div className="px-4 pt-4">{head}</div>
      )}
      {shown && (
        <ul className={cx('flex flex-col gap-2 px-4 pb-4', !collapsible && 'pt-2.5', collapsible && 'animate-[fadeIn_160ms_ease-out]')}>
          {lines.map((l, i) => (
            <li key={i} className="flex items-start gap-2 text-xs leading-4 text-[#4b5563]">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-[#9aa1ac]" />
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


export function HdsUploadBox({
  file,
  onFile,
  hint = 'PDF, JPG or PNG up to 10MB',
  accept = '.pdf,.jpg,.jpeg,.png',
  label,
  status = 'Uploaded',
}: {
  file: string | null
  onFile: (name: string | null) => void
  hint?: string
  accept?: string
  label?: ReactNode
  status?: string
}) {
  // HDS "Upload Box" (5sbjyGVqYhZPnWSTIFdCXK 57:35): State=Empty (dashed box, navy featured icon) and
  // State=Success (file row, grey featured icon, "1.2 MB · Uploaded", round remove button).
  const input = useRef<HTMLInputElement>(null)
  const [size, setSize] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const take = (f: File | undefined) => {
    if (!f) return
    const mb = f.size / (1024 * 1024)
    setSize(f.size ? (mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.max(1, Math.round(f.size / 1024))} KB`) : null)
    onFile(f.name)
  }
  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <p className="text-sm font-medium leading-5 text-[#111927]">{label}</p>}
      <input
        ref={input}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          take(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      {file ? (
        <div className="flex w-full items-center gap-3 overflow-hidden rounded-xl border border-[#cbd0d8] bg-white px-4 py-3.5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#edeff2]">
            <img src={uploadFileIcon} alt="" className="h-[14.33px] w-[11.67px]" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium leading-5 text-[#111927]">{file}</span>
            <span className="text-[11px] leading-4 text-[#6b7280]">{size ? `${size} · ${status}` : status}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${file}`}
            onClick={() => {
              setSize(null)
              onFile(null)
            }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f5f6f8] transition-colors hover:bg-[#edeff2]"
          >
            <img src={uploadRemoveIcon} alt="" className="size-[7.75px]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            take(e.dataTransfer.files?.[0])
          }}
          className={cx(
            'flex w-full flex-col items-center justify-center gap-2.5 rounded-xl border-[1.5px] border-dashed px-6 py-7 text-center transition-colors',
            dragging ? 'border-[#004b87] bg-[#eaf2f9]' : 'border-[#cbd0d8] bg-[#f5f6f8] hover:border-[#9aa1ac]',
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-[#d1e3f3]">
            <img src={uploadIcon} alt="" className="size-[13.33px]" />
          </span>
          <span className="text-sm font-medium leading-5 text-[#111927]">Click to upload or drag and drop</span>
          <span className="text-[11px] leading-4 text-[#6b7280]">{hint}</span>
        </button>
      )}
    </div>
  )
}

export function HdsStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex h-5 w-full items-center gap-2" aria-label="Progress">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} aria-current={active ? 'step' : undefined} className={cx('flex items-center gap-2', i < steps.length - 1 && 'flex-1')}>
            <span
              className={cx(
                'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold leading-[14px] transition-colors',
                active || done ? 'bg-[#004b87] text-white' : 'border-[1.5px] border-[#e1e4ea] bg-white text-[#555354]',
              )}
            >
              {done ? '✓' : i + 1}
            </span>
            <span className={cx('whitespace-nowrap text-[13px]', active ? 'font-semibold text-[#222]' : 'font-medium text-[#555354]')}>{label}</span>
            {i < steps.length - 1 && <span className={cx('h-px flex-1', done ? 'bg-[#004b87]' : 'bg-[#e1e4ea]')} />}
          </li>
        )
      })}
    </ol>
  )
}
