import { useEffect, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { buzz } from '../lib/store'

type Variant = 'primary' | 'pink' | 'blue' | 'gold' | 'ghost' | 'dark' | 'danger' | 'green'

const variants: Record<Variant, string> = {
  primary: 'text-white bg-[linear-gradient(110deg,#ff2bd6,#8b5cf6_55%,#2fa8ff)] shadow-[0_8px_30px_-8px_rgba(255,43,214,.7)]',
  pink: 'text-white bg-[linear-gradient(135deg,#ff2bd6,#c0129f)] shadow-pink',
  blue: 'text-white bg-[linear-gradient(135deg,#2fa8ff,#1460d6)] shadow-blue',
  gold: 'text-night-950 bg-[linear-gradient(135deg,#ffe08a,#ffc83d_45%,#e39b00)] shadow-gold',
  green: 'text-night-950 bg-[linear-gradient(135deg,#7dffb2,#22c55e)] shadow-[0_0_24px_-6px_rgba(34,197,94,.7)]',
  ghost: 'text-white bg-white/[.06] border border-white/15',
  dark: 'text-white bg-night-700 border border-white/10',
  danger: 'text-white bg-red-600/90 border border-red-400/40',
}

export function Btn({ variant = 'primary', size = 'lg', className = '', children, onClick, ...rest }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'xl' }) {
  const sz = size === 'xl' ? 'min-h-[64px] text-lg px-6' : size === 'lg' ? 'min-h-[56px] text-base px-5' : 'min-h-[46px] text-sm px-4'
  return (
    <button
      {...rest}
      onClick={(e) => { buzz(); onClick?.(e) }}
      className={`relative inline-flex select-none items-center justify-center gap-2 rounded-2xl font-extrabold tracking-wide
        transition-transform duration-150 active:scale-[.96] disabled:opacity-40 disabled:active:scale-100 ${sz} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', glow }: { children: ReactNode; className?: string; glow?: 'pink' | 'blue' | 'gold' }) {
  const g = glow === 'pink' ? 'border-fuchsia-neon/40 shadow-pink' : glow === 'blue' ? 'border-electric/40 shadow-blue' : glow === 'gold' ? 'border-gold/50 shadow-gold' : 'border-white/10'
  return <div className={`rounded-3xl border bg-night-800/80 backdrop-blur-md ${g} ${className}`}>{children}</div>
}

export function Progress({ pct, className = '', color = 'party' }: { pct: number; className?: string; color?: 'party' | 'gold' }) {
  const bar = color === 'gold' ? 'bg-[linear-gradient(90deg,#ffe08a,#ffc83d)]' : 'bg-[linear-gradient(90deg,#ff2bd6,#8b5cf6,#2fa8ff)]'
  return (
    <div className={`h-3 w-full overflow-hidden rounded-full bg-white/10 ${className}`} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full ${bar} transition-[width] duration-700 ease-out`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  )
}

export function Chip({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[.06] px-3 py-1 text-xs font-bold text-white/85 ${className}`}>{children}</span>
}

export function TopBar({ title, onBack, right }: { title?: ReactNode; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-3 flex items-center gap-2 bg-night-950/80 px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl">
      {onBack && (
        <button onClick={() => { buzz(); onBack() }} aria-label="Volver" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[.06] text-xl active:scale-95">
          ←
        </button>
      )}
      <div className="min-w-0 flex-1 truncate font-display text-[15px] font-extrabold uppercase tracking-wide">{title}</div>
      {right}
    </header>
  )
}

/** Hoja inferior (bottom sheet) */
export function Sheet({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[rise_.2s_ease-out_both]" onClick={onClose} />
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border-t border-white/15 bg-night-900 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 animate-rise">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/25" />
        {title && <h2 className="mb-4 text-center font-display text-xl font-extrabold">{title}</h2>}
        {children}
      </div>
    </div>
  )
}

export function SectionTitle({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <h3 className="mb-2 mt-1 flex items-center gap-2 text-[13px] font-extrabold uppercase tracking-[.14em] text-white/60">
      <span className="text-base" aria-hidden>{icon}</span>{children}
    </h3>
  )
}

export function Bullets({ items, ordered }: { items: string[]; ordered?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-snug text-white/90">
          <span className={`mt-[2px] grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-extrabold ${ordered ? 'bg-white/10' : 'bg-transparent text-fuchsia-neon'}`}>{ordered ? i + 1 : '•'}</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}
