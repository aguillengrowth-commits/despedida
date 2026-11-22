import { useEffect, useState } from 'react'
import type { Activity, Mode, Result, TeamId } from '../data/types'
import { MODE_LABEL } from '../data/games'
import { useStore } from '../lib/store'
import { Btn, Sheet } from './ui'
import { celebrate } from './effects'

const MODES: { id: Mode; icon: string; short: string }[] = [
  { id: 'teams', icon: '💗💙', short: 'Teams' },
  { id: 'gender', icon: '👩👨', short: 'H vs M' },
  { id: 'individual', icon: '👤', short: 'Individual' },
  { id: 'pairs', icon: '💑', short: 'Parejas' },
  { id: 'none', icon: '🎈', short: 'Sin ganador' },
]

const teamLabel = (t: TeamId) => (t === 'estefany' ? 'TEAM ESTEFANY' : 'TEAM ANTONIO')

/** Pantalla “¿Quién ganó este juego?” */
export function ResultSheet({ activity, open, onClose, onSaved }: { activity: Activity; open: boolean; onClose: () => void; onSaved: () => void }) {
  const { s, d } = useStore()
  const prev = s.results[activity.id]
  const [mode, setMode] = useState<Mode>(prev?.mode ?? activity.defaultMode)
  const [name, setName] = useState(prev?.name ?? '')
  const [assign, setAssign] = useState<TeamId | null>(prev?.assignTeam ?? null)

  useEffect(() => {
    if (open) { setMode(prev?.mode ?? activity.defaultMode); setName(prev?.name ?? ''); setAssign(prev?.assignTeam ?? null) }
  }, [open]) // eslint-disable-line

  const save = (r: Omit<Result, 'at'>) => {
    d({ type: 'result', id: activity.id, result: { ...r, at: Date.now() } })
    d({ type: 'status', id: activity.id, status: 'done' })
    d({ type: 'timer', id: activity.id, timer: { elapsed: s.timers[activity.id]?.elapsed ?? 0, startedAt: null } })
    // celebración
    const w = r.mode === 'teams' || r.mode === 'gender' ? r.winner : r.assignTeam
    if (r.mode === 'none') celebrate({ emoji: '✅', title: '¡Listo!', subtitle: `${activity.title} completado`, color: 'party', ms: 1600 })
    else if (w === 'tie') celebrate({ emoji: '🤝', title: '¡EMPATE!', subtitle: `${s.scoring.tie} puntos para cada lado`, color: 'gold' })
    else if (w === 'estefany') celebrate({ emoji: '💗', title: '¡PUNTO PARA TEAM ESTEFANY!', subtitle: r.name ? `Ganó: ${r.name}` : undefined, color: 'pink' })
    else if (w === 'antonio') celebrate({ emoji: '💙', title: '¡PUNTO PARA TEAM ANTONIO!', subtitle: r.name ? `Ganó: ${r.name}` : undefined, color: 'blue' })
    else if (w === 'mujeres') celebrate({ emoji: '👩', title: '¡GANAN LAS MUJERES!', subtitle: 'Marcador Hombres vs. Mujeres', color: 'pink' })
    else if (w === 'hombres') celebrate({ emoji: '👨', title: '¡GANAN LOS HOMBRES!', subtitle: 'Marcador Hombres vs. Mujeres', color: 'blue' })
    else celebrate({ emoji: '🏆', title: `¡${r.name || 'Tenemos ganador'}!`, subtitle: 'Sin puntos de equipo', color: 'gold' })
    onSaved()
  }

  const clear = () => { d({ type: 'result', id: activity.id, result: null }); d({ type: 'status', id: activity.id, status: 'active' }); onClose() }

  return (
    <Sheet open={open} onClose={onClose} title={<>🏆 ¿Quién ganó este juego?</>}>
      <p className="-mt-2 mb-4 text-center text-sm text-white/60">{activity.emoji} {activity.title}</p>

      {/* Selector de modalidad */}
      <div className="mb-4 grid grid-cols-5 gap-1.5 rounded-2xl bg-white/[.04] p-1.5" role="radiogroup" aria-label="Modalidad">
        {MODES.map((m) => (
          <button key={m.id} role="radio" aria-checked={mode === m.id} onClick={() => setMode(m.id)}
            className={`flex min-h-[54px] flex-col items-center justify-center rounded-xl text-[11px] font-extrabold leading-tight transition ${mode === m.id ? 'bg-white text-night-950' : 'text-white/70'}`}>
            <span className="text-base">{m.icon}</span>{m.short}
          </button>
        ))}
      </div>
      <p className="mb-4 text-center text-xs font-bold uppercase tracking-widest text-white/45">{MODE_LABEL[mode]}</p>

      {mode === 'teams' && (
        <div className="grid gap-3">
          <Btn variant="pink" size="xl" onClick={() => save({ mode, winner: 'estefany' })}>💗 TEAM ESTEFANY</Btn>
          <Btn variant="blue" size="xl" onClick={() => save({ mode, winner: 'antonio' })}>💙 TEAM ANTONIO</Btn>
          <Btn variant="gold" size="lg" onClick={() => save({ mode, winner: 'tie' })}>🤝 EMPATE</Btn>
        </div>
      )}

      {mode === 'gender' && (
        <div className="grid gap-3">
          <Btn variant="pink" size="xl" onClick={() => save({ mode, winner: 'mujeres' })}>👩 MUJERES</Btn>
          <Btn variant="blue" size="xl" onClick={() => save({ mode, winner: 'hombres' })}>👨 HOMBRES</Btn>
          <Btn variant="gold" size="lg" onClick={() => save({ mode, winner: 'tie' })}>🤝 EMPATE</Btn>
          <p className="text-center text-xs text-white/50">Este marcador va separado del de Teams.</p>
        </div>
      )}

      {(mode === 'individual' || mode === 'pairs') && (
        <div className="grid gap-3">
          <label className="text-sm font-bold text-white/70" htmlFor="wn">{mode === 'pairs' ? '💑 Pareja ganadora' : '👤 Ganador(a)'} <span className="font-normal text-white/40">(opcional)</span></label>
          <input id="wn" value={name} onChange={(e) => setName(e.target.value)} placeholder={mode === 'pairs' ? 'Ej. Carla y Diego' : 'Ej. Tío Lucho'}
            className="min-h-[56px] rounded-2xl border border-white/15 bg-night-800 px-4 text-lg font-semibold outline-none focus:border-fuchsia-neon" />
          <div className="text-sm font-bold text-white/70">¿Suma para algún equipo?</div>
          <div className="grid grid-cols-3 gap-2">
            {([['estefany', '💗 Estefany', 'bg-fuchsia-neon text-white'], ['antonio', '💙 Antonio', 'bg-electric text-white'], [null, 'Ninguno', 'bg-white text-night-950']] as const).map(([v, l, on]) => (
              <button key={String(v)} onClick={() => setAssign(v as TeamId | null)} aria-pressed={assign === v}
                className={`min-h-[52px] rounded-2xl border border-white/10 text-sm font-extrabold transition ${assign === v ? on : 'bg-white/[.05] text-white/80'}`}>{l}</button>
            ))}
          </div>
          <Btn variant="gold" size="xl" className="mt-1" onClick={() => save({ mode, winner: assign, name: name.trim() || undefined, assignTeam: assign })}>
            🏆 Guardar ganador
          </Btn>
        </div>
      )}

      {mode === 'none' && (
        <div className="grid gap-3">
          <p className="text-center text-sm text-white/60">Esta actividad no suma puntos. Puedes anotar un nombre para el recuerdo.</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (opcional)" aria-label="Nombre opcional"
            className="min-h-[56px] rounded-2xl border border-white/15 bg-night-800 px-4 text-lg font-semibold outline-none focus:border-fuchsia-neon" />
          <Btn variant="green" size="xl" onClick={() => save({ mode, winner: null, name: name.trim() || undefined })}>✅ Marcar completado</Btn>
        </div>
      )}

      {prev && (
        <button onClick={clear} className="mx-auto mt-5 block min-h-[44px] px-4 text-sm font-bold text-red-300 underline underline-offset-4">
          Borrar resultado guardado ({prev.mode === 'teams' || prev.mode === 'gender' ? (prev.winner === 'tie' ? 'empate' : prev.winner) : prev.name || (prev.assignTeam ? teamLabel(prev.assignTeam) : '—')})
        </button>
      )}
      <p className="mt-3 text-center text-[11px] text-white/35">Corregir reemplaza el resultado anterior: nunca se duplican puntos.</p>
    </Sheet>
  )
}

export function resultLabel(r?: Result): string | null {
  if (!r) return null
  if (r.mode === 'none') return r.name ? r.name : 'Completado'
  if (r.mode === 'teams') return r.winner === 'tie' ? '🤝 Empate' : r.winner === 'estefany' ? '💗 Team Estefany' : '💙 Team Antonio'
  if (r.mode === 'gender') return r.winner === 'tie' ? '🤝 Empate H/M' : r.winner === 'mujeres' ? '👩 Mujeres' : '👨 Hombres'
  const t = r.assignTeam ? (r.assignTeam === 'estefany' ? ' · 💗' : ' · 💙') : ''
  return `${r.mode === 'pairs' ? '💑' : '👤'} ${r.name || 'Ganador'}${t}`
}
