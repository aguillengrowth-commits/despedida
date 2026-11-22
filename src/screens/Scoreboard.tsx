import { ALL } from '../data/games'
import { useStore } from '../lib/store'
import { Btn, Card, TopBar } from '../components/ui'
import { GenderBars, TeamBars } from '../components/Blocks'
import { resultLabel } from '../components/ResultSheet'
import type { Nav } from '../App'

export function Scoreboard({ nav }: { nav: Nav }) {
  const { s, awardsUnlocked } = useStore()
  const played = ALL.filter((a) => s.results[a.id] && s.statuses[a.id] !== 'skipped').sort((x, y) => s.results[x.id].at - s.results[y.id].at)

  return (
    <div>
      <TopBar title="🏆 Marcador" onBack={() => nav({ name: 'home' })} />
      <div className="space-y-4">
        <TeamBars />
        <GenderBars />

        <Btn variant={awardsUnlocked ? 'gold' : 'dark'} size="lg" className="w-full" onClick={() => nav({ name: 'activity', id: 'premiacion' })}>
          {awardsUnlocked ? '🏆 IR A LA GRAN PREMIACIÓN' : '🔒 Premiación (se desbloquea al final)'}
        </Btn>

        <Card className="p-5">
          <div className="mb-3 text-xs font-extrabold uppercase tracking-[.2em] text-white/50">Historial de resultados</div>
          {played.length === 0 ? (
            <p className="text-sm text-white/50">Todavía no hay resultados. ¡Que empiece la competencia! 🔥</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {played.map((a) => (
                <li key={a.id}>
                  <button onClick={() => nav({ name: 'activity', id: a.id })} className="flex min-h-[56px] w-full items-center gap-3 py-2 text-left">
                    <span className="text-2xl">{a.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold">{a.title}</span>
                      <span className="block truncate text-sm text-white/60">{resultLabel(s.results[a.id])}</span>
                    </span>
                    <span className="text-xs font-bold text-white/40">Editar ›</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <p className="text-center text-xs text-white/40">Ganador {s.scoring.win} pts · Perdedor {s.scoring.lose} pt · Empate {s.scoring.tie} c/u (editable en Ajustes)</p>
      </div>
    </div>
  )
}
