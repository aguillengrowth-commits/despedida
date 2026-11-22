import { useEffect, useRef, useState } from 'react'
import type { Activity } from '../data/types'
import { buzz, useStore } from '../lib/store'
import { AwardsPanel, FinaleButton, FontControls, HypeDeck, KIND_META, MusicBadge, QuestionDeck, Speech } from './Blocks'
import { Timer } from './Timer'
import { Btn, Progress, Sheet } from './ui'
import { resultLabel } from './ResultSheet'

interface Props {
  activity: Activity
  onExit: () => void
  onOpenResult: () => void
  onFinish: () => void
  onPlayTiebreak: () => void
}

/** 🎤 MODO CONDUCTOR: guía paso a paso a pantalla completa */
export function Conductor({ activity, onExit, onOpenResult, onFinish, onPlayTiebreak }: Props) {
  const { s, d } = useStore()
  const steps = activity.flow
  const idx = Math.min(s.conductorStep[activity.id] ?? 0, steps.length - 1)
  const step = steps[idx]
  const meta = KIND_META[step.kind]
  const last = idx === steps.length - 1
  const [list, setList] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)
  const scroller = useRef<HTMLDivElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const go = (n: number) => {
    if (n < 0 || n >= steps.length) return
    buzz(10)
    setDir(n > idx ? 1 : -1)
    d({ type: 'step', id: activity.id, step: n })
  }

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [idx])

  // Mantener la pantalla encendida mientras se conduce
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    const req = async () => { try { lock = await (navigator as any).wakeLock?.request('screen') } catch { /* */ } }
    req()
    const vis = () => document.visibilityState === 'visible' && req()
    document.addEventListener('visibilitychange', vis)
    return () => { document.removeEventListener('visibilitychange', vis); lock?.release().catch(() => {}) }
  }, [])

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(idx + 1); if (e.key === 'ArrowLeft') go(idx - 1) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  })

  const result = s.results[activity.id]
  const needsResult = activity.competitive || activity.kind === 'game'

  const finish = () => {
    if (needsResult && !result && activity.flow.some((f) => f.special === 'result')) { onOpenResult(); return }
    onFinish()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night-950"
      onTouchStart={(e) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }}
      onTouchEnd={(e) => {
        const t = touch.current; touch.current = null
        if (!t) return
        const dx = e.changedTouches[0].clientX - t.x, dy = e.changedTouches[0].clientY - t.y
        if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx < 0 ? idx + 1 : idx - 1)
      }}>
      {/* luz ambiental según tipo de paso */}
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-72 opacity-60 blur-3xl transition-colors duration-500 ${step.kind === 'say' ? 'bg-fuchsia-neon/30' : step.kind === 'music' ? 'bg-electric/30' : step.kind === 'rule' ? 'bg-gold/25' : 'bg-white/10'}`} />

      {/* barra superior */}
      <div className="relative z-10 px-4 pt-[max(10px,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2">
          <button onClick={() => { buzz(); onExit() }} aria-label="Salir del modo conductor (se guarda el paso)" className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.06] text-lg active:scale-95">✕</button>
          <button onClick={() => setList(true)} className="min-w-0 flex-1 text-left">
            <div className="truncate text-[11px] font-extrabold uppercase tracking-[.18em] text-white/50">🎤 Modo conductor · {activity.emoji} {activity.title}</div>
            <div className="text-sm font-bold text-white/80">Paso {idx + 1} de {steps.length} <span className="text-white/40">· ver todos ▾</span></div>
          </button>
          <FontControls />
        </div>
        <Progress pct={((idx + 1) / steps.length) * 100} className="mt-3 !h-2" />
      </div>

      {/* tarjeta del paso */}
      <div ref={scroller} className="relative z-10 flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div key={idx} className={`rounded-[28px] border-2 ${meta.ring} ${meta.glow} bg-night-800/90 p-5 ${dir === 1 ? 'animate-rise' : 'animate-[riseBack_.35s_cubic-bezier(.2,.8,.2,1)_both]'}`}>
          <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black tracking-widest ${meta.chip}`}>
            <span aria-hidden>{meta.icon}</span>{meta.label}
          </div>
          <div className="mb-1 text-xs font-bold uppercase tracking-widest text-white/40">Paso {idx + 1}</div>
          <h2 className="mb-4 font-display text-[26px] font-black leading-tight">{step.title}</h2>

          {step.kind === 'music' && <div className="mb-4"><MusicBadge step={step} /></div>}
          {step.text && <p className="mb-4 leading-snug text-white/85" style={{ fontSize: `${18 * s.fontScale}px` }}>{step.text}</p>}
          {step.speech && <Speech lines={step.speech} big />}

          {step.special === 'timer' && <Timer id={activity.id} suggestedMin={activity.durationMin} />}
          {step.special === 'hype' && <HypeDeck activity={activity} />}
          {step.special === 'questions' && <QuestionDeck activity={activity} />}
          {step.special === 'awards' && <AwardsPanel onPlayTiebreak={onPlayTiebreak} />}
          {step.special === 'finale' && <FinaleButton />}
          {step.special === 'result' && (
            <div className="space-y-3">
              {result && <div className="rounded-2xl bg-gold/10 px-4 py-3 text-center font-bold text-gold ring-1 ring-gold/40">Guardado: {resultLabel(result)}</div>}
              <Btn variant="gold" size="xl" className="w-full" onClick={onOpenResult}>🏆 {result ? 'Corregir resultado' : '¿Quién ganó?'}</Btn>
            </div>
          )}
        </div>

        {/* vista previa del siguiente paso */}
        {!last && (
          <button onClick={() => go(idx + 1)} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-dashed border-white/10 px-4 py-3 text-left text-sm text-white/50">
            <span>Sigue:</span><span aria-hidden>{KIND_META[steps[idx + 1].kind].icon}</span><span className="truncate font-bold text-white/70">{steps[idx + 1].title}</span>
          </button>
        )}
      </div>

      {/* navegación inferior */}
      <div className="relative z-10 grid grid-cols-[1fr_2fr] gap-3 border-t border-white/10 bg-night-950/95 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <Btn variant="ghost" size="xl" onClick={() => go(idx - 1)} disabled={idx === 0}>← Atrás</Btn>
        {last
          ? <Btn variant="green" size="xl" onClick={finish}>✅ Finalizar</Btn>
          : <Btn variant="primary" size="xl" onClick={() => go(idx + 1)}>Siguiente →</Btn>}
      </div>

      <Sheet open={list} onClose={() => setList(false)} title="Todos los pasos">
        <ol className="space-y-2">
          {steps.map((st, i) => (
            <li key={i}>
              <button onClick={() => { go(i); setList(false) }} className={`flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 text-left ${i === idx ? 'bg-white text-night-950' : i < idx ? 'bg-white/[.04] text-white/45' : 'bg-white/[.06]'}`}>
                <span className="w-6 text-center text-sm font-black">{i + 1}</span>
                <span aria-hidden>{KIND_META[st.kind].icon}</span>
                <span className="flex-1 font-bold">{st.title}</span>
                {i < idx && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ol>
      </Sheet>
    </div>
  )
}
