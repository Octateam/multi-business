import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { HdsButton, type ButtonVariant } from './hds'

// Thin wrapper kept for existing call sites — renders the HDS Button (Figma HDS 798:2).
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  shape?: 'default' | 'pill'
  loading?: boolean
  icon?: ReactNode
  children?: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', shape, loading, icon, children, ...rest }: ButtonProps) {
  return (
    <HdsButton variant={variant} size={size} shape={shape} loading={loading} leadingIcon={icon} {...rest}>
      {children}
    </HdsButton>
  )
}
