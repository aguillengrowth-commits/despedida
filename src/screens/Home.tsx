import { byId } from '../data/games'
import { useStore } from '../lib/store'
import { Btn, Progress } from '../components/ui'
import type { Nav } from '../App'

export function Home({ nav }: { nav: Nav }) {
  const { progress, nextId, scores, s } = useStore()
  const next = nextId ? byId(nextId) : null
  const started = progress.done > 0
  const { teams } = scores

  return (
    <div className="flex min-h-[calc(100dvh-90px)] flex-col pt-[max(18px,env(safe-area-inset-top))]">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* anillos neón */}
        <div className="relative mb-6 h-36 w-52 animate-floaty" aria-hidden>
          <div className="absolute left-2 top-2 h-32 w-32 rounded-full border-[6px] border-fuchsia-neon shadow-[0_0_30px_#ff2bd6,inset_0_0_20px_#ff2bd6]" />
          <div className="absolute right-2 top-2 h-32 w-32 rounded-full border-[6px] border-electric shadow-[0_0_30px_#2fa8ff,inset_0_0_20px_#2fa8ff]" />
          <div className="absolute left-1/2 top-[-6px] -translate-x-1/2 text-4xl drop-shadow-[0_0_14px_#ffc83d]">✨</div>
        </div>

        <div className="text-sm font-extrabold uppercase tracking-[.35em] text-gold drop-shadow-[0_0_10px_rgba(255,200,61,.6)]">🎉 La gran despedida 🎉</div>
        <h1 className="mt-3 font-display text-[44px] font-black leading-[.95] tracking-tight">
          <span className="text-fuchsia-neon drop-shadow-[0_0_18px_rgba(255,43,214,.8)] animate-flicker">ANTONIO</span>
          <span className="mx-2 text-gold">&</span>
          <br />
          <span className="text-electric drop-shadow-[0_0_18px_rgba(47,168,255,.8)]">ESTEFANY</span>
        </h1>
        <p className="mt-4 max-w-xs text-lg font-semibold text-white/80">“Una noche para recordar… o para que nos la cuenten mañana”. 😂</p>

        {s.partyStarted && <div className="mt-4 rounded-full bg-gold/15 px-4 py-2 text-sm font-extrabold text-gold ring-1 ring-gold/40">🥂 ¡Juegos terminados — ahora a bailar!</div>}
      </div>

      <div className="space-y-3 pb-4">
        {/* progreso + marcador mini */}
        <button onClick={() => nav({ name: 'scoreboard' })} className="w-full rounded-3xl border border-white/10 bg-night-800/70 p-4 text-left backdrop-blur active:scale-[.99] transition">
          <div className="mb-2 flex items-center justify-between text-xs font-extrabold uppercase tracking-widest text-white/55">
            <span>Progreso de la noche</span><span>{progress.done}/{progress.total}</span>
          </div>
          <Progress pct={progress.pct} />
          <div className="mt-3 flex items-center justify-between font-display font-extrabold">
            <span className="text-fuchsia-neon">💗 {teams.estefany}</span>
            <span className="text-[11px] uppercase tracking-widest text-white/40">Ver marcador 🏆</span>
            <span className="text-electric">{teams.antonio} 💙</span>
          </div>
        </button>

        <Btn variant="primary" size="xl" className="w-full animate-pulseRing" onClick={() => next ? nav({ name: 'activity', id: next.id }) : nav({ name: 'scoreboard' })}>
          {next ? (started ? <>▶ CONTINUAR · {next.emoji} {next.title}</> : <>🎉 COMENZAR LA FIESTA</>) : <>🏆 VER RESULTADOS</>}
        </Btn>
        <Btn variant="ghost" size="lg" className="w-full" onClick={() => nav({ name: 'itinerary' })}>🎮 VER ITINERARIO</Btn>

        <p className="px-4 pt-2 text-center text-xs leading-relaxed text-white/45">
          Organizado con mucho cariño, risas y algunas maldades por la familia y los amigos de los novios. 💗💙
        </p>
      </div>
    </div>
  )
}
