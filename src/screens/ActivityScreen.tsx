import { useEffect, useState } from 'react'
import { ACTIVITIES, MODE_LABEL, MUSIC_META, SAFETY_GENERAL, byId } from '../data/games'
import { useStore } from '../lib/store'
import { Btn, Bullets, Card, Chip, SectionTitle, Sheet, TopBar } from '../components/ui'
import { AwardsPanel, FinaleButton, FontControls, KIND_META, Penitencias, QuestionDeck, Speech } from '../components/Blocks'
import { Timer } from '../components/Timer'
import { ResultSheet, resultLabel } from '../components/ResultSheet'
import { Conductor } from '../components/Conductor'
import type { Nav } from '../App'

type Tab = 'guion' | 'prep' | 'reglas' | 'frases'
const TABS: { id: Tab; label: string }[] = [
  { id: 'guion', label: '📜 Guion' },
  { id: 'prep', label: '🛠️ Preparar' },
  { id: 'reglas', label: '⚠️ Reglas' },
  { id: 'frases', label: '📣 Frases' },
]

export function ActivityScreen({ id, conductor, nav, setConductor }: { id: string; conductor: boolean; nav: Nav; setConductor: (v: boolean) => void }) {
  const { s, d, nextId, awardsUnlocked } = useStore()
  const a = byId(id)
  const [tab, setTab] = useState<Tab>('guion')
  const [resultOpen, setResultOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [skipAsk, setSkipAsk] = useState(false)
  const st = s.statuses[id] ?? 'pending'
  const r = s.results[id]
  const isWild = a.kind === 'wildcard'
  const step = s.conductorStep[id] ?? 0
  const locked = a.kind === 'awards' && !awardsUnlocked

  useEffect(() => { window.scrollTo({ top: 0 }); setTab('guion'); setSaved(false) }, [id])
  useEffect(() => { if (st === 'pending' && !isWild && !locked) d({ type: 'status', id, status: 'active' }); d({ type: 'current', id }) }, [id]) // eslint-disable-line

  const nextAfter = (() => {
    if (isWild) return nextId
    const i = ACTIVITIES.findIndex((x) => x.id === id)
    const n = ACTIVITIES.slice(i + 1).find((x) => s.statuses[x.id] !== 'done' && s.statuses[x.id] !== 'skipped')
    return n?.id ?? nextId
  })()
  const next = nextAfter && nextAfter !== id ? byId(nextAfter) : null

  const complete = () => { d({ type: 'status', id, status: 'done' }); d({ type: 'timer', id, timer: { elapsed: s.timers[id]?.elapsed ?? 0, startedAt: null } }) }
  const skip = () => { d({ type: 'status', id, status: 'skipped' }); setSkipAsk(false); nav({ name: 'itinerary' }) }
  const startConductor = () => { if (isWild && st === 'pending') d({ type: 'status', id, status: 'active' }); setConductor(true) }

  const onSaved = () => {
    setResultOpen(false)
    if (conductor) {
      const ri = a.flow.findIndex((f) => f.special === 'result')
      if (ri >= 0 && ri < a.flow.length - 1) d({ type: 'step', id, step: ri + 1 })
    } else setSaved(true)
  }

  const finishFromConductor = () => {
    if (st !== 'done') complete()
    setConductor(false)
    setTimeout(() => nav({ name: 'itinerary' }), 30)
  }

  const statusChip = st === 'done' ? (r && r.mode !== 'none' ? '🏆 Ganador registrado' : '✅ Completado') : st === 'skipped' ? '⏭️ Omitido' : st === 'active' ? '🎮 En curso' : '🔒 Pendiente'

  return (
    <div className="pb-40">
      <TopBar title={<>{a.emoji} {a.title}</>} onBack={() => nav({ name: 'itinerary' })} right={<FontControls />} />

      {/* HERO */}
      <div className="relative mb-4 overflow-hidden rounded-[30px] border border-white/10 bg-[radial-gradient(circle_at_20%_0%,rgba(255,43,214,.3),transparent_60%),radial-gradient(circle_at_100%_100%,rgba(47,168,255,.25),transparent_55%)] p-5 animate-rise">
        <div className="flex items-start gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-white/10 text-5xl shadow-inner animate-floaty">{a.emoji}</div>
          <div className="min-w-0">
            <div className="text-[11px] font-extrabold uppercase tracking-[.2em] text-gold">{typeof a.stage === 'number' ? `Etapa ${a.stage}` : `Juego comodín ${a.stage}`}</div>
            <h1 className="font-display text-2xl font-black leading-tight">{a.title}</h1>
            <p className="mt-1 text-sm font-semibold text-white/70">{a.tagline}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip>⏱️ {a.durationMin} min</Chip>
          <Chip>👥 {a.participants}</Chip>
          <Chip>{a.competitive ? '🏆' : '🎈'} {a.competitive ? MODE_LABEL[a.defaultMode] : 'No suma puntos'}</Chip>
          <Chip className={st === 'done' ? '!border-green-400/40 !text-green-300' : st === 'active' ? '!border-electric/50 !text-[#9fd6ff]' : ''}>{statusChip}</Chip>
        </div>
        {r && <div className="mt-3 rounded-2xl bg-gold/10 px-4 py-2.5 text-sm font-extrabold text-gold ring-1 ring-gold/40">🏆 {resultLabel(r)}</div>}
      </div>

      {locked ? (
        <AwardsPanel />
      ) : (
        <>
          {/* CTA principal: modo conductor */}
          <Btn variant="primary" size="xl" className="mb-3 w-full" onClick={startConductor}>
            🎤 {isWild && st === 'pending' ? 'JUGAR AHORA · MODO CONDUCTOR' : step > 0 ? `CONTINUAR EN PASO ${step + 1}` : 'ACTIVAR MODO CONDUCTOR'}
          </Btn>

          {/* Bloques especiales */}
          {a.kind === 'couple' && <div className="mb-4"><QuestionDeck activity={a} /></div>}
          {a.kind === 'awards' && <div className="mb-4"><AwardsPanel onPlayTiebreak={() => nav({ name: 'activity', id: 'pollo' })} /></div>}
          {a.kind === 'finale' && (
            <Card glow="gold" className="mb-4 p-5">
              <SectionTitle icon="🎤">Brindis — leer en voz alta</SectionTitle>
              <Speech lines={a.intro} />
              <div className="mt-5"><FinaleButton /></div>
            </Card>
          )}

          {a.kind !== 'awards' && a.kind !== 'finale' && <div className="mb-4"><Timer id={id} suggestedMin={a.durationMin} compact /></div>}

          {/* Tabs */}
          <div className="sticky top-[calc(max(12px,env(safe-area-inset-top))+56px)] z-20 -mx-4 mb-4 bg-night-950/85 px-4 py-2 backdrop-blur-xl">
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white/[.05] p-1" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                  className={`min-h-[44px] rounded-xl text-[12px] font-extrabold transition ${tab === t.id ? 'bg-white text-night-950' : 'text-white/65'}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div key={tab} className="animate-rise space-y-4">
            {tab === 'guion' && (
              <>
                <Card className="p-5">
                  <SectionTitle icon="🎤">Speech de presentación</SectionTitle>
                  <Speech lines={a.intro} />
                </Card>
                <div>
                  <SectionTitle icon="🗺️">Secuencia paso a paso</SectionTitle>
                  <ol className="relative space-y-2 border-l-2 border-white/10 pl-4">
                    {a.flow.map((f, i) => {
                      const m = KIND_META[f.kind]
                      return (
                        <li key={i} className="relative">
                          <span className={`absolute -left-[27px] top-3 grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${m.chip}`}>{i + 1}</span>
                          <button onClick={() => { d({ type: 'step', id, step: i }); startConductor() }} className={`w-full rounded-2xl border ${m.ring} bg-night-800/70 p-3 text-left active:scale-[.99] transition`}>
                            <div className="text-[10px] font-black tracking-widest text-white/50">{m.icon} {m.label}</div>
                            <div className="font-bold">{f.title}</div>
                            {f.kind === 'music' && f.cue && <div className="mt-1 text-sm font-extrabold text-[#9fd6ff]">{MUSIC_META[f.cue].icon} {MUSIC_META[f.cue].label}</div>}
                            {f.text && <div className="mt-1 text-sm text-white/70">{f.text}</div>}
                            {f.speech && <div className="mt-1 line-clamp-2 text-sm italic text-white/60">“{f.speech[0]}”</div>}
                          </button>
                        </li>
                      )
                    })}
                  </ol>
                  <p className="mt-2 text-xs text-white/40">Toca cualquier paso para abrir el modo conductor ahí.</p>
                </div>
              </>
            )}

            {tab === 'prep' && (
              <>
                <Card className="p-5"><SectionTitle icon="🧰">Materiales</SectionTitle><Bullets items={a.materials} /></Card>
                <Card className="p-5"><SectionTitle icon="📐">Preparación del espacio</SectionTitle><Bullets items={a.setup} ordered /></Card>
                <Card className="p-5"><SectionTitle icon="📋">Para el organizador</SectionTitle><Bullets items={a.organizer} /></Card>
                <Card className="p-5" glow="blue"><SectionTitle icon="🎵">Música</SectionTitle><p className="text-[15px] text-white/85">{a.music}</p><p className="mt-2 text-xs text-white/45">Las indicaciones exactas (play, pausa, volumen) aparecen en cada paso del guion.</p></Card>
              </>
            )}

            {tab === 'reglas' && (
              <>
                {a.rulesSpeech.length > 0 && <Card className="p-5"><SectionTitle icon="🎤">Explicar las reglas (leer)</SectionTitle><Speech lines={a.rulesSpeech} /></Card>}
                <Card className="p-5" glow="gold"><SectionTitle icon="⚠️">Reglas del juego</SectionTitle><Bullets items={a.rules} ordered /></Card>
                <Card className="p-5"><SectionTitle icon="🏆">Cómo identificar al ganador</SectionTitle><p className="text-[15px] text-white/85">{a.winnerHow}</p></Card>
                <Card className="p-5"><SectionTitle icon="🛟">Buena onda y seguridad</SectionTitle><Bullets items={[...(a.safety ?? []), ...SAFETY_GENERAL.slice(0, 3)]} /></Card>
              </>
            )}

            {tab === 'frases' && (
              <>
                <Card className="p-5" glow="pink"><SectionTitle icon="📣">Frases para animar</SectionTitle><Bullets items={a.hype} /></Card>
                {a.winnerSpeech.length > 0 && <Card className="p-5"><SectionTitle icon="🏆">Anunciar al ganador</SectionTitle><Speech lines={a.winnerSpeech} /></Card>}
                <Card className="p-5"><SectionTitle icon="➡️">Transición al siguiente</SectionTitle><Speech lines={[a.transition]} /></Card>
                {(a.id === 'gota' || a.id === 'botella') && <Card className="p-5"><SectionTitle icon="🎲">Penitencias (todas sin alcohol obligatorio)</SectionTitle><Penitencias /></Card>}
              </>
            )}
          </div>
        </>
      )}

      {/* Barra inferior de acciones */}
      {!locked && a.kind !== 'awards' && a.kind !== 'finale' && (
        <div className="fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 mx-auto max-w-lg px-4">
          <div className="flex gap-2 rounded-3xl border border-white/10 bg-night-900/95 p-2 shadow-2xl backdrop-blur-xl">
            {st === 'done' && next ? (
              <Btn variant="green" className="flex-1" onClick={() => nav({ name: 'activity', id: next.id })}>Siguiente: {next.emoji} {next.title.split(' ').slice(0, 3).join(' ')} →</Btn>
            ) : a.flow.some((f) => f.special === 'result') ? (
              <Btn variant="gold" className="flex-1" onClick={() => setResultOpen(true)}>🏆 {r ? 'Corregir resultado' : 'Registrar resultado'}</Btn>
            ) : (
              <Btn variant="green" className="flex-1" onClick={() => { complete(); setSaved(true) }}>✅ {a.kind === 'ceremony' ? 'Bienvenida completada' : a.kind === 'break' ? 'Descanso completado' : 'Marcar completado'}</Btn>
            )}
            {st === 'done' && a.flow.some((f) => f.special === 'result') && (
              <Btn variant="dark" size="lg" aria-label="Corregir resultado" onClick={() => setResultOpen(true)}>✏️</Btn>
            )}
            {st !== 'done' && st !== 'skipped' && (
              <Btn variant="dark" size="lg" onClick={() => setSkipAsk(true)}>{isWild ? 'Omitir' : '⏭️'}</Btn>
            )}
          </div>
        </div>
      )}

      <ResultSheet activity={a} open={resultOpen} onClose={() => setResultOpen(false)} onSaved={onSaved} />

      {/* Después de guardar */}
      <Sheet open={saved} onClose={() => setSaved(false)} title="¡Resultado guardado! 🎉">
        <p className="-mt-2 mb-5 text-center text-white/65">{r ? resultLabel(r) : 'Actividad completada'} · marcador actualizado.</p>
        <div className="grid gap-3">
          {next && <Btn variant="primary" size="xl" onClick={() => { setSaved(false); nav({ name: 'activity', id: next.id }) }}>Ir a: {next.emoji} {next.title} →</Btn>}
          <Btn variant="green" size="lg" onClick={() => { setSaved(false); nav({ name: 'itinerary' }) }}>✅ GUARDAR Y VOLVER AL ITINERARIO</Btn>
        </div>
      </Sheet>

      {/* Confirmar omitir */}
      <Sheet open={skipAsk} onClose={() => setSkipAsk(false)} title="¿Omitir este juego?">
        <p className="-mt-2 mb-5 text-center text-white/65">Si el ambiente no da o falta tiempo, no pasa nada. Podrás volver a abrirlo luego.</p>
        <div className="grid gap-3">
          <Btn variant="danger" size="lg" onClick={skip}>⏭️ Sí, omitir juego</Btn>
          <Btn variant="ghost" size="lg" onClick={() => setSkipAsk(false)}>Cancelar</Btn>
        </div>
      </Sheet>

      {conductor && !locked && (
        <Conductor activity={a} onExit={() => setConductor(false)} onOpenResult={() => setResultOpen(true)} onFinish={finishFromConductor}
          onPlayTiebreak={() => { setConductor(false); nav({ name: 'activity', id: 'pollo' }) }} />
      )}
    </div>
  )
}
