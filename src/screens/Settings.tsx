import { useState } from 'react'
import { PENITENCIAS, REQUIRED_FOR_AWARDS, SAFETY_GENERAL } from '../data/games'
import type { Scoring } from '../data/types'
import { buzz, useStore } from '../lib/store'
import { Btn, Bullets, Card, SectionTitle, Sheet, TopBar } from '../components/ui'
import { FontControls } from '../components/Blocks'
import type { Nav } from '../App'

export function Settings({ nav }: { nav: Nav }) {
  const { s, d, isClosed, awardsUnlocked } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmUnlock, setConfirmUnlock] = useState(false)
  const [typed, setTyped] = useState('')

  const Stepper = ({ k, label }: { k: keyof Scoring; label: string }) => (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="font-bold">{label}</span>
      <div className="flex items-center gap-2">
        <button aria-label={`Restar a ${label}`} onClick={() => { buzz(); d({ type: 'scoring', scoring: { ...s.scoring, [k]: Math.max(0, s.scoring[k] - 1) } }) }} className="h-11 w-11 rounded-xl bg-white/10 text-xl font-black active:scale-95">−</button>
        <span className="w-8 text-center font-display text-2xl font-black tabular-nums">{s.scoring[k]}</span>
        <button aria-label={`Sumar a ${label}`} onClick={() => { buzz(); d({ type: 'scoring', scoring: { ...s.scoring, [k]: Math.min(20, s.scoring[k] + 1) } }) }} className="h-11 w-11 rounded-xl bg-white/10 text-xl font-black active:scale-95">+</button>
      </div>
    </div>
  )

  return (
    <div className="pb-6">
      <TopBar title="⚙️ Configuración" onBack={() => nav({ name: 'home' })} />
      <div className="space-y-4">
        <Card className="p-5">
          <SectionTitle icon="🧮">Puntuación</SectionTitle>
          <Stepper k="win" label="🏆 Equipo ganador" />
          <Stepper k="lose" label="🙃 Equipo perdedor" />
          <Stepper k="tie" label="🤝 Empate (c/u)" />
          <p className="mt-2 text-xs text-white/45">El marcador se recalcula al instante con todos los resultados guardados.</p>
        </Card>

        <Card className="flex items-center justify-between p-5">
          <div><div className="font-bold">🔠 Tamaño del texto</div><div className="text-xs text-white/50">Speech y frases · {Math.round(s.fontScale * 100)}%</div></div>
          <FontControls />
        </Card>

        <Card className="p-5">
          <SectionTitle icon="📲">Instalar en el celular</SectionTitle>
          <Bullets items={[
            'Android (Chrome): menú ⋮ → “Instalar app” o “Agregar a pantalla principal”.',
            'iPhone (Safari): botón Compartir ⬆️ → “Agregar a inicio”.',
            'Ábrela una vez con internet: después funciona sin conexión.',
            'Todo se guarda en este celular. Si cambias de conductor, pásale el celular. 😉',
          ]} />
        </Card>

        <Card className="p-5"><SectionTitle icon="🛟">Reglas de buena onda</SectionTitle><Bullets items={SAFETY_GENERAL} /></Card>
        <Card className="p-5"><SectionTitle icon="🎲">Penitencias (con opción sin alcohol)</SectionTitle><Bullets items={PENITENCIAS} /></Card>

        {!awardsUnlocked && (
          <Btn variant="ghost" size="lg" className="w-full" onClick={() => setConfirmUnlock(true)}>🔓 Desbloquear premiación ahora</Btn>
        )}
        <Btn variant="danger" size="lg" className="w-full" onClick={() => { setTyped(''); setConfirmReset(true) }}>⚙️ REINICIAR EVENTO</Btn>
        <p className="text-center text-xs text-white/35">Hecho con 💗💙 para Antonio & Estefany</p>
      </div>

      <Sheet open={confirmReset} onClose={() => setConfirmReset(false)} title="¿Reiniciar todo el evento?">
        <p className="-mt-2 mb-4 text-center text-white/65">Se borran juegos completados, ganadores, puntajes, cronómetros y pasos. No se puede deshacer.</p>
        <label htmlFor="cf" className="mb-2 block text-center text-sm font-bold">Escribe <span className="text-red-300">BORRAR</span> para confirmar</label>
        <input id="cf" value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" className="mb-4 min-h-[56px] w-full rounded-2xl border border-white/15 bg-night-800 px-4 text-center text-lg font-black tracking-widest outline-none focus:border-red-400" />
        <div className="grid gap-3">
          <Btn variant="danger" size="lg" disabled={typed.trim().toUpperCase() !== 'BORRAR'} onClick={() => { d({ type: 'reset' }); setConfirmReset(false); nav({ name: 'home' }) }}>Sí, reiniciar</Btn>
          <Btn variant="ghost" size="lg" onClick={() => setConfirmReset(false)}>Cancelar</Btn>
        </div>
      </Sheet>

      <Sheet open={confirmUnlock} onClose={() => setConfirmUnlock(false)} title="¿Saltar a la premiación?">
        <p className="-mt-2 mb-5 text-center text-white/65">Las actividades principales que falten se marcarán como omitidas (no suman puntos).</p>
        <div className="grid gap-3">
          <Btn variant="gold" size="lg" onClick={() => {
            REQUIRED_FOR_AWARDS.forEach((id) => { if (!isClosed(id)) d({ type: 'status', id, status: 'skipped' }) })
            setConfirmUnlock(false); nav({ name: 'activity', id: 'premiacion' })
          }}>🔓 Sí, ir a la premiación</Btn>
          <Btn variant="ghost" size="lg" onClick={() => setConfirmUnlock(false)}>Cancelar</Btn>
        </div>
      </Sheet>
    </div>
  )
}
