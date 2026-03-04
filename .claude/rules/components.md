# Component & Styling Rules

## Component Structure
- One component per file, named export matching filename
- Props interface defined above component: `interface PanelProps { ... }`
- Use arrow function style: `export const Panel = ({ title }: PanelProps) => { ... }`
- Colocate sub-components in same file if < 50 lines, otherwise split

## shadcn/ui Usage
- Import from `@/components/ui/{component}`
- Never modify shadcn source files directly — override with className props
- Add new shadcn components via CLI: `npx shadcn@latest add {component}`
- Commonly needed: Button, Card, Badge, Tooltip, Dialog, Tabs, Select, Input

## Panel System
- Every dashboard module is wrapped in `<Panel>` component
- Panel provides: header bar, loading skeleton, error boundary, collapse toggle
- Panel header shows: title, variant accent dot, optional action buttons
- Grid layout: CSS Grid with `var(--panel-gap)` spacing

## Styling
- Tailwind utility classes for all styling — no CSS modules or styled-components
- Use `cn()` from `@/lib/utils` for conditional class merging
- Color tokens from CSS custom properties (--bg-panel, --text-primary, etc.)
- Never use arbitrary hex values — always reference design tokens
- Responsive: mobile-first, breakpoints at sm(640) md(768) lg(1024) xl(1280)

## Animation
- Framer Motion for panel enter/exit: `initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}`
- Number tickers: animate value changes with spring physics
- Skeleton loading: pulse animation on `bg-[var(--bg-hover)]` elements
- Keep animations under 300ms for snappy feel
- Use `layout` prop on motion elements for smooth reflows

## Data Display
- Addresses: truncate to `{first4}...{last4}` format
- Large numbers: compact format (1.2M, 3.4B) using Intl.NumberFormat
- Prices: 2-6 decimal places depending on magnitude
- Percentages: always show +/- sign, color green/red
- Timestamps: relative time ("2m ago") for recent, absolute for older
- Use JetBrains Mono (`font-family: var(--font-mono)`) for all numeric data

## Accessibility
- All interactive elements need proper aria labels
- Keyboard navigation for panel focus and actions
- Color is never the only indicator — pair with icons or text
- Minimum contrast ratio 4.5:1 for all text
