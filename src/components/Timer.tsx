import { useEffect, useState } from 'react'
import { buzz, useStore } from '../lib/store'

const fmt = (ms: number) => {
  const t = Math.floor(ms / 1000)
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

/** Cronómetro opcional por juego. No detiene el juego al llegar a la duración sugerida. */
export function Timer({ id, suggestedMin, compact }: { id: string; suggestedMin: number; compact?: boolean }) {
  const { s, d } = useStore()
  const t = s.timers[id] ?? { elapsed: 0, startedAt: null }
  const running = t.startedAt !== null
  const [, tick] = useState(0)

  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => tick((x) => x + 1), 500)
    return () => clearInterval(iv)
  }, [running])

  const ms = t.elapsed + (running ? Date.now() - (t.startedAt as number) : 0)
  const goal = suggestedMin * 60_000
  const pct = Math.min(1, ms / goal)
  const over = ms > goal

  const start = () => { buzz(); d({ type: 'timer', id, timer: { elapsed: t.elapsed, startedAt: Date.now() } }) }
  const pause = () => { buzz(); d({ type: 'timer', id, timer: { elapsed: ms, startedAt: null } }) }
  const reset = () => { buzz(20); d({ type: 'timer', id, timer: { elapsed: 0, startedAt: null } }) }

  const R = 34, C = 2 * Math.PI * R
  return (
    <div className={`flex items-center gap-4 rounded-3xl border ${over ? 'border-gold/50' : 'border-white/10'} bg-night-800/80 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="relative grid h-[84px] w-[84px] shrink-0 place-items-center">
        <svg viewBox="0 0 80 80" className="absolute inset-0 -rotate-90">
          <circle cx="40" cy="40" r={R} stroke="rgba(255,255,255,.1)" strokeWidth="7" fill="none" />
          <circle cx="40" cy="40" r={R} stroke={over ? '#ffc83d' : 'url(#tg)'} strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .5s linear' }} />
          <defs><linearGradient id="tg"><stop offset="0" stopColor="#ff2bd6" /><stop offset="1" stopColor="#2fa8ff" /></linearGradient></defs>
        </svg>
        <span className="font-display text-lg font-extrabold tabular-nums">{fmt(ms)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold uppercase tracking-widest text-white/50">⏱️ Cronómetro</div>
        <div className={`text-sm font-semibold ${over ? 'text-gold' : 'text-white/80'}`}>
          {over ? `Pasamos los ${suggestedMin} min sugeridos` : `Sugerido: ${suggestedMin} min`}
        </div>
        <div className="mt-2 flex gap-2">
          {running
            ? <button onClick={pause} className="min-h-[44px] flex-1 rounded-xl bg-white/10 font-extrabold active:scale-95">⏸ Pausar</button>
            : <button onClick={start} className="min-h-[44px] flex-1 rounded-xl bg-[linear-gradient(135deg,#7dffb2,#22c55e)] font-extrabold text-night-950 active:scale-95">▶ {ms > 0 ? 'Seguir' : 'Iniciar'}</button>}
          <button onClick={reset} aria-label="Reiniciar cronómetro" className="min-h-[44px] w-12 rounded-xl border border-white/10 bg-white/[.04] font-extrabold active:scale-95">↺</button>
        </div>
      </div>
    </div>
  )
}
