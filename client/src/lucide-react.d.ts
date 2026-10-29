declare module 'lucide-react' {
  import type * as React from 'react'

  export type LucideProps = React.SVGProps<SVGSVGElement> & {
    size?: number | string
    strokeWidth?: number | string
    absoluteStrokeWidth?: boolean
    color?: string
  }

  export type LucideIcon = React.ComponentType<LucideProps>

  export const ArrowRight: LucideIcon
  export const ArrowUpRight: LucideIcon
  export const Check: LucideIcon
  export const ChevronDown: LucideIcon
  export const ChevronRight: LucideIcon
  export const Heart: LucideIcon
  export const Menu: LucideIcon
  export const Minus: LucideIcon
  export const Plus: LucideIcon
  export const Search: LucideIcon
  export const ShoppingBag: LucideIcon
  export const SlidersHorizontal: LucideIcon
  export const Sparkles: LucideIcon
  export const Star: LucideIcon
  export const X: LucideIcon
}
