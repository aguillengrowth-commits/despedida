import { useState } from 'react'
import type { Activity, Step, TeamId } from '../data/types'
import { MUSIC_META, PENITENCIAS } from '../data/games'
import { buzz, useStore } from '../lib/store'
import { Btn, Card, Progress } from './ui'
import { celebrate, fireConfetti } from './effects'

/* ───────── estilos por tipo de paso ───────── */
export const KIND_META = {
  say: { icon: '🎤', label: 'DECIR EN VOZ ALTA', ring: 'border-fuchsia-neon/50', chip: 'bg-fuchsia-neon text-white', glow: 'shadow-pink' },
  do: { icon: '🛠️', label: 'HACER / PREPARAR', ring: 'border-white/20', chip: 'bg-white text-night-950', glow: '' },
  music: { icon: '🎵', label: 'INDICACIÓN MUSICAL', ring: 'border-electric/50', chip: 'bg-electric text-white', glow: 'shadow-blue' },
  rule: { icon: '⚠️', label: 'REGLA IMPORTANTE', ring: 'border-gold/60', chip: 'bg-gold text-night-950', glow: 'shadow-gold' },
} as const

/** Texto para leer en voz alta (tamaño ajustable) */
export function Speech({ lines, big }: { lines: string[]; big?: boolean }) {
  const { s } = useStore()
  const base = big ? 22 : 17
  return (
    <div className="space-y-3" style={{ fontSize: `${base * s.fontScale}px` }}>
      {lines.map((l, i) => {
        const stage = /^\[.*\]$/.test(l.trim())
        return stage
          ? <p key={i} className="text-[.8em] font-bold italic text-gold/90">{l}</p>
          : <p key={i} className="font-semibold leading-[1.35] text-white">“{l}”</p>
      })}
    </div>
  )
}

export function FontControls() {
  const { s, d } = useStore()
  const set = (v: number) => { buzz(); d({ type: 'font', scale: Math.min(1.8, Math.max(0.8, +v.toFixed(2))) }) }
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[.05] p-1">
      <button onClick={() => set(s.fontScale - 0.15)} aria-label="Achicar texto" className="h-10 w-10 rounded-xl text-sm font-extrabold active:bg-white/10">A−</button>
      <button onClick={() => set(s.fontScale + 0.15)} aria-label="Agrandar texto" className="h-10 w-10 rounded-xl text-lg font-extrabold active:bg-white/10">A+</button>
    </div>
  )
}

/** Indicación musical destacada */
export function MusicBadge({ step }: { step: Step }) {
  const m = step.cue ? MUSIC_META[step.cue] : MUSIC_META.prepare
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-electric/15 px-4 py-3 ring-1 ring-electric/40">
      <span className="text-3xl" aria-hidden>{m.icon}</span>
      <span className="font-display text-lg font-extrabold tracking-wide text-[#9fd6ff]">{m.label}</span>
    </div>
  )
}

/** Frases para animar: se muestran de a una, tocando para cambiar */
export function HypeDeck({ activity }: { activity: Activity }) {
  const [i, setI] = useState(0)
  const { s } = useStore()
  const list = activity.hype
  return (
    <div>
      <button onClick={() => { buzz(); setI((i + 1) % list.length) }}
        className="w-full rounded-3xl border border-fuchsia-neon/40 bg-[linear-gradient(140deg,rgba(255,43,214,.18),rgba(47,168,255,.12))] p-5 text-left active:scale-[.98] transition">
        <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-fuchsia-neon">📣 Frase {i + 1}/{list.length} · toca para la siguiente</div>
        <div key={i} className="animate-rise font-display font-extrabold leading-tight" style={{ fontSize: `${22 * s.fontScale}px` }}>{list[i]}</div>
      </button>
    </div>
  )
}

/** ¿Quién de los dos? – preguntas una por una */
export function QuestionDeck({ activity }: { activity: Activity }) {
  const { s, d } = useStore()
  const qs = activity.questions ?? []
  const i = Math.min(s.questionIdx, qs.length)
  const done = i >= qs.length
  const go = (n: number) => { buzz(); d({ type: 'question', idx: Math.max(0, Math.min(qs.length, n)) }); if (n === qs.length) fireConfetti('party') }
  return (
    <div className="rounded-3xl border border-fuchsia-neon/40 bg-[radial-gradient(circle_at_50%_0%,rgba(255,43,214,.25),transparent_70%)] p-5">
      <div className="mb-3 flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-white/60">
        <span>❤️ ¿Quién de los dos?</span><span>{Math.min(i + 1, qs.length)} / {qs.length}</span>
      </div>
      <Progress pct={(i / qs.length) * 100} className="mb-5" />
      {done ? (
        <div className="py-6 text-center animate-pop">
          <div className="text-6xl">💍</div>
          <div className="mt-3 font-display text-2xl font-black">¡Un aplauso enorme para nuestros futuros esposos!</div>
        </div>
      ) : (
        <div key={i} className="min-h-[170px] animate-rise">
          <div className="mb-2 font-display text-5xl font-black text-fuchsia-neon/80">#{i + 1}</div>
          <div className="font-display font-extrabold leading-tight" style={{ fontSize: `${30 * s.fontScale}px` }}>{qs[i]}</div>
          <div className="mt-4 text-sm font-bold text-gold/90">“1, 2, 3… ¡ya!” 🪧 ANTONIO · ESTEFANY</div>
        </div>
      )}
      <div className="mt-5 grid grid-cols-[1fr_2fr] gap-3">
        <Btn variant="ghost" onClick={() => go(i - 1)} disabled={i === 0}>← Anterior</Btn>
        {done
          ? <Btn variant="ghost" onClick={() => go(0)}>↺ Reiniciar preguntas</Btn>
          : <Btn variant="pink" onClick={() => go(i + 1)}>{i === qs.length - 1 ? 'Terminar ❤️' : 'Siguiente pregunta →'}</Btn>}
      </div>
    </div>
  )
}

export function Penitencias() {
  return (
    <ul className="space-y-2">
      {PENITENCIAS.map((p) => <li key={p} className="rounded-2xl bg-white/[.05] px-4 py-3 text-[15px]">🎲 {p}</li>)}
    </ul>
  )
}

/* ───────── Premiación ───────── */
export function AwardsPanel({ onPlayTiebreak }: { onPlayTiebreak?: () => void }) {
  const { s, d, scores, awardsUnlocked } = useStore()
  const { teams } = scores
  const tie = teams.estefany === teams.antonio
  const champ: TeamId | null = tie ? s.tiebreak : teams.estefany > teams.antonio ? 'estefany' : 'antonio'

  const announce = () => {
    if (!champ) return
    d({ type: 'champion', value: true })
    d({ type: 'status', id: 'premiacion', status: 'done' })
    celebrate({ emoji: '🏆', title: champ === 'estefany' ? '¡TEAM ESTEFANY!' : '¡TEAM ANTONIO!', subtitle: '¡CAMPEONES DE LA DESPEDIDA!', color: 'gold', ms: 5000 })
    setTimeout(() => fireConfetti(champ === 'estefany' ? 'pink' : 'blue', 1.4), 900)
  }

  if (!awardsUnlocked) {
    return (
      <Card className="p-5 text-center">
        <div className="text-5xl">🔒</div>
        <div className="mt-2 font-display text-lg font-extrabold">Premiación bloqueada</div>
        <p className="mt-1 text-sm text-white/60">Se desbloquea cuando completes u omitas todas las actividades principales (las etapas 0 a 9).</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <TeamBars />
      <GenderBars />
      {tie && (
        <Card glow="gold" className="p-5 text-center">
          <div className="font-display text-2xl font-black text-gold">¡TENEMOS UN EMPATE! ¡SE NECESITA UN DESEMPATE!</div>
          <p className="mt-2 text-sm text-white/70">Haz una ronda rápida de 🐔 Aprieta el Pollo y Canta (1 representante por equipo, 3 canciones). ¿Quién ganó?</p>
          {onPlayTiebreak && <Btn variant="ghost" size="md" className="mt-3 w-full" onClick={onPlayTiebreak}>🐔 Ver instrucciones del pollo</Btn>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Btn variant={s.tiebreak === 'estefany' ? 'pink' : 'ghost'} onClick={() => d({ type: 'tiebreak', team: 'estefany' })}>💗 Estefany</Btn>
            <Btn variant={s.tiebreak === 'antonio' ? 'blue' : 'ghost'} onClick={() => d({ type: 'tiebreak', team: 'antonio' })}>💙 Antonio</Btn>
          </div>
        </Card>
      )}
      {champ && (
        <Btn variant="gold" size="xl" className="w-full animate-pulseRing" onClick={announce}>🏆 ANUNCIAR CAMPEÓN</Btn>
      )}
      {s.championAnnounced && champ && (
        <Card glow="gold" className="p-6 text-center animate-pop">
          <div className="text-6xl">👑</div>
          <div className="mt-2 text-xs font-extrabold uppercase tracking-[.3em] text-gold">Campeón de la despedida</div>
          <div className={`mt-1 font-display text-3xl font-black ${champ === 'estefany' ? 'text-fuchsia-neon' : 'text-electric'}`}>TEAM {champ === 'estefany' ? 'ESTEFANY' : 'ANTONIO'}</div>
          {tie && <div className="mt-1 text-sm text-white/60">Ganó en el desempate</div>}
        </Card>
      )}
    </div>
  )
}

export function TeamBars() {
  const { scores } = useStore()
  const { teams } = scores
  const max = Math.max(teams.estefany, teams.antonio, 1)
  const lead = teams.estefany === teams.antonio ? null : teams.estefany > teams.antonio ? 'e' : 'a'
  const Row = ({ who, pts, wins }: { who: 'e' | 'a'; pts: number; wins: number }) => (
    <div>
      <div className="mb-1.5 flex items-end justify-between">
        <div className={`font-display text-sm font-extrabold ${who === 'e' ? 'text-fuchsia-neon' : 'text-electric'}`}>
          {who === 'e' ? '💗 TEAM ESTEFANY' : '💙 TEAM ANTONIO'} {lead === who && <span className="ml-1">👑</span>}
        </div>
        <div className="text-right"><span className="font-display text-3xl font-black tabular-nums">{pts}</span><span className="ml-1 text-xs text-white/50">pts</span></div>
      </div>
      <div className="h-5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full transition-[width] duration-700 ${who === 'e' ? 'bg-[linear-gradient(90deg,#c0129f,#ff2bd6)] shadow-pink' : 'bg-[linear-gradient(90deg,#1460d6,#2fa8ff)] shadow-blue'}`} style={{ width: `${(pts / max) * 100}%` }} />
      </div>
      <div className="mt-1 text-xs font-semibold text-white/50">{wins} {wins === 1 ? 'juego ganado' : 'juegos ganados'}</div>
    </div>
  )
  return (
    <Card className="space-y-4 p-5">
      <div className="text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Marcador principal</div>
      <Row who="e" pts={teams.estefany} wins={teams.winsE} />
      <Row who="a" pts={teams.antonio} wins={teams.winsA} />
      {teams.ties > 0 && <div className="text-xs text-white/50">🤝 {teams.ties} empate(s)</div>}
    </Card>
  )
}

export function GenderBars() {
  const { scores } = useStore()
  const g = scores.gender
  const total = g.mujeres + g.hombres
  const pm = total ? (g.mujeres / total) * 100 : 50
  return (
    <Card className="p-5">
      <div className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Marcador aparte · Hombres vs. Mujeres</div>
      <div className="mb-2 flex justify-between font-display font-extrabold">
        <span>👩 Mujeres <span className="text-2xl tabular-nums">{g.mujeres}</span></span>
        <span><span className="text-2xl tabular-nums">{g.hombres}</span> Hombres 👨</span>
      </div>
      <div className="flex h-4 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-[#ff7ae6] transition-[width] duration-700" style={{ width: `${pm}%` }} />
        <div className="h-full flex-1 bg-[#7cc8ff]" />
      </div>
      <div className="mt-1 flex justify-between text-xs text-white/50"><span>{g.winsM} ganados</span><span>{g.winsH} ganados</span></div>
      {total === 0 && <p className="mt-2 text-xs text-white/40">Aún no hay juegos en modalidad Hombres vs. Mujeres. Puedes elegirla al registrar cualquier juego.</p>}
    </Card>
  )
}

export function FinaleButton() {
  const { d } = useStore()
  return (
    <Btn variant="primary" size="xl" className="w-full animate-pulseRing" onClick={() => {
      d({ type: 'status', id: 'brindis', status: 'done' })
      d({ type: 'party', value: true })
      celebrate({ emoji: '🎉', title: '¡QUE COMIENCE LA FIESTA!', subtitle: '¡Salud por Antonio & Estefany! 🥂', color: 'party', ms: 5000 })
      setTimeout(() => fireConfetti('gold', 1.4), 700)
      setTimeout(() => fireConfetti('party', 1.2), 1600)
    }}>🎉 ¡QUE COMIENCE LA FIESTA!</Btn>
  )
}
