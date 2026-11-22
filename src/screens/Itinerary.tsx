import { ACTIVITIES, WILDCARDS } from '../data/games'
import type { Activity } from '../data/types'
import { useStore } from '../lib/store'
import { Progress, TopBar } from '../components/ui'
import { resultLabel } from '../components/ResultSheet'
import type { Nav } from '../App'

export function Itinerary({ nav }: { nav: Nav }) {
  const { s, progress, nextId, awardsUnlocked } = useStore()
  const left = progress.total - progress.done

  const Row = ({ a, i }: { a: Activity; i: number }) => {
    const st = s.statuses[a.id] ?? 'pending'
    const r = s.results[a.id]
    const isNext = a.id === nextId
    const locked = a.kind === 'awards' && !awardsUnlocked
    const closed = st === 'done' || st === 'skipped'
    const badge = locked ? '🔒' : st === 'skipped' ? '⏭️' : st === 'done' ? (r && r.mode !== 'none' ? '🏆' : '✅') : st === 'active' ? '🎮' : isNext ? '👉' : '🔒'
    const label = locked ? 'Bloqueado' : st === 'skipped' ? 'Omitido' : st === 'done' ? (r && r.mode !== 'none' ? 'Ganador registrado' : 'Completado') : st === 'active' ? 'En curso' : isNext ? 'Siguiente' : 'Pendiente'
    return (
      <li className="animate-rise" style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
        <button onClick={() => nav({ name: 'activity', id: a.id })}
          className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-3xl border p-3 pr-4 text-left transition active:scale-[.98]
            ${isNext ? 'border-fuchsia-neon/60 bg-[linear-gradient(120deg,rgba(255,43,214,.18),rgba(47,168,255,.1))] shadow-pink' : st === 'active' ? 'border-electric/50 bg-night-800' : 'border-white/10 bg-night-800/70'}
            ${closed ? 'opacity-55' : ''}`}>
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl ${closed ? 'bg-white/[.04] grayscale' : 'bg-white/[.07]'}`}>{a.emoji}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-extrabold uppercase tracking-widest text-white/45">
              {typeof a.stage === 'number' ? `Etapa ${a.stage}` : `Comodín ${a.stage}`} · {a.durationMin} min
            </div>
            <div className={`truncate font-display text-[15px] font-extrabold leading-tight ${closed ? 'line-through decoration-white/40' : ''}`}>{a.title}</div>
            <div className="mt-0.5 truncate text-xs font-semibold text-white/60">{r ? resultLabel(r) : a.tagline}</div>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-0.5">
            <span className="text-xl" aria-hidden>{badge}</span>
            <span className={`text-[9px] font-extrabold uppercase tracking-wide ${isNext ? 'text-fuchsia-neon' : 'text-white/45'}`}>{label}</span>
          </div>
        </button>
      </li>
    )
  }

  return (
    <div>
      <TopBar title="🎮 Itinerario" onBack={() => nav({ name: 'home' })} />
      <div className="mb-4 rounded-3xl border border-white/10 bg-night-800/70 p-4">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <div className="font-display text-2xl font-black">{progress.pct}%</div>
            <div className="text-xs font-bold text-white/55">{left === 0 ? '¡Todo listo! 🎉' : `Faltan ${left} ${left === 1 ? 'actividad' : 'actividades'}`}</div>
          </div>
          <div className="text-right text-xs font-bold text-white/55">{progress.done} de {progress.total}<br />completadas</div>
        </div>
        <Progress pct={progress.pct} />
      </div>

      <ol className="space-y-2.5">
        {ACTIVITIES.map((a, i) => <Row key={a.id} a={a} i={i} />)}
      </ol>

      <h2 className="mb-1 mt-8 font-display text-lg font-extrabold">🃏 Juegos comodín</h2>
      <p className="mb-3 text-sm text-white/55">Opcionales. Úsalos si hay tiempo o si el ambiente lo pide. No bloquean la premiación.</p>
      <ol className="space-y-2.5">
        {WILDCARDS.map((a, i) => <Row key={a.id} a={a} i={i} />)}
      </ol>
    </div>
  )
}
