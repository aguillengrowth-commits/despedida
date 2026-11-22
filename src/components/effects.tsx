import { useEffect, useRef, useState } from 'react'

/* ───────────────────── Confeti (canvas, sin dependencias) ───────────────────── */
type Palette = 'party' | 'pink' | 'blue' | 'gold'
const PALETTES: Record<Palette, string[]> = {
  party: ['#ff2bd6', '#2fa8ff', '#ffc83d', '#ffffff', '#8b5cf6'],
  pink: ['#ff2bd6', '#ff7ae6', '#ffd1f5', '#ffc83d'],
  blue: ['#2fa8ff', '#7cc8ff', '#d6eeff', '#ffc83d'],
  gold: ['#ffc83d', '#ffe08a', '#fff4cc', '#ff2bd6', '#2fa8ff'],
}

export function fireConfetti(palette: Palette = 'party', power = 1) {
  window.dispatchEvent(new CustomEvent('confetti', { detail: { palette, power } }))
}

interface P { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; shape: number; life: number }

export function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    let parts: P[] = []
    let raf = 0
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio }
    resize()
    addEventListener('resize', resize)

    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      const dpr = devicePixelRatio
      parts = parts.filter((p) => p.life > 0 && p.y < innerHeight + 40)
      for (const p of parts) {
        p.vy += 0.18; p.vx *= 0.992; p.vy *= 0.992
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 1
        ctx.save()
        ctx.translate(p.x * dpr, p.y * dpr)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.c
        ctx.globalAlpha = Math.min(1, p.life / 40)
        if (p.shape === 0) ctx.fillRect(-p.r * dpr, -p.r * dpr * 0.45, p.r * 2 * dpr, p.r * 0.9 * dpr)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.7 * dpr, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      }
      if (parts.length) raf = requestAnimationFrame(loop)
      else raf = 0
    }

    const onFire = (e: Event) => {
      const { palette, power } = (e as CustomEvent).detail as { palette: Palette; power: number }
      const cols = PALETTES[palette] || PALETTES.party
      const n = Math.round((reduce ? 40 : 160) * power)
      const burst = (ox: number, dir: number) => {
        for (let i = 0; i < n / 2; i++) {
          const a = (-Math.PI / 2) + dir * (0.25 + Math.random() * 0.75)
          const sp = 9 + Math.random() * 11
          parts.push({ x: ox, y: innerHeight * 0.95, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * 1.25, r: 4 + Math.random() * 5, c: cols[(Math.random() * cols.length) | 0], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, shape: Math.random() < 0.7 ? 0 : 1, life: 160 + Math.random() * 80 })
        }
      }
      burst(0, 1); burst(innerWidth, -1)
      if (!raf) raf = requestAnimationFrame(loop)
    }
    addEventListener('confetti', onFire)
    return () => { removeEventListener('confetti', onFire); removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[85] h-full w-full" aria-hidden />
}

/* ───────────────────── Celebración a pantalla completa ───────────────────── */
export interface CelebrateOpts { emoji: string; title: string; subtitle?: string; color?: 'pink' | 'blue' | 'gold' | 'party'; ms?: number }

export function celebrate(o: CelebrateOpts) {
  window.dispatchEvent(new CustomEvent('celebrate', { detail: o }))
}

export function CelebrationLayer() {
  const [o, setO] = useState<CelebrateOpts | null>(null)
  useEffect(() => {
    let t: number
    const on = (e: Event) => {
      const d = (e as CustomEvent).detail as CelebrateOpts
      setO(d)
      fireConfetti(d.color === 'pink' ? 'pink' : d.color === 'blue' ? 'blue' : d.color === 'gold' ? 'gold' : 'party', d.color === 'gold' ? 1.6 : 1)
      try { navigator.vibrate?.([30, 40, 30, 40, 80]) } catch { /* */ }
      clearTimeout(t)
      t = window.setTimeout(() => setO(null), d.ms ?? 2400)
    }
    addEventListener('celebrate', on)
    return () => { removeEventListener('celebrate', on); clearTimeout(t) }
  }, [])
  if (!o) return null
  const glow = o.color === 'pink' ? 'text-fuchsia-neon drop-shadow-[0_0_24px_#ff2bd6]' : o.color === 'blue' ? 'text-electric drop-shadow-[0_0_24px_#2fa8ff]' : o.color === 'gold' ? 'text-gold drop-shadow-[0_0_28px_#ffc83d]' : 'text-white drop-shadow-[0_0_24px_#8b5cf6]'
  return (
    <button onClick={() => setO(null)} className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-night-950/55 px-6 text-center backdrop-blur-md animate-[rise_.25s_ease-out_both]" aria-live="assertive">
      <div className="animate-pop text-[96px] leading-none">{o.emoji}</div>
      <div className={`animate-pop max-w-full break-words font-display text-[clamp(26px,8.5vw,40px)] font-black uppercase leading-tight ${glow}`} style={{ animationDelay: '.08s' }}>{o.title}</div>
      {o.subtitle && <div className="animate-rise text-lg font-semibold text-white/80" style={{ animationDelay: '.2s' }}>{o.subtitle}</div>}
      <div className="mt-6 text-xs uppercase tracking-widest text-white/40">Toca para cerrar</div>
    </button>
  )
}

/* ───────────────────── Fondo animado (luces de discoteca) ───────────────────── */
export function PartyBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night-950" aria-hidden>
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-neon/25 blur-[100px] animate-floaty" />
      <div className="absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-electric/20 blur-[110px] animate-floaty" style={{ animationDelay: '-2s' }} />
      <div className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[110px] animate-floaty" style={{ animationDelay: '-1s' }} />
      <div className="absolute inset-0 opacity-[.08] [background-image:radial-gradient(#fff_1px,transparent_1px)] [background-size:22px_22px]" />
    </div>
  )
}
