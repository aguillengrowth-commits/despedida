import { useCallback, useEffect, useRef, useState } from 'react'
import { StoreProvider, buzz, useStore, type Screen } from './lib/store'
import { ALL } from './data/games'
import { CelebrationLayer, ConfettiCanvas, PartyBackdrop } from './components/effects'
import { Home } from './screens/Home'
import { Itinerary } from './screens/Itinerary'
import { ActivityScreen } from './screens/ActivityScreen'
import { Scoreboard } from './screens/Scoreboard'
import { Settings } from './screens/Settings'

export type Nav = (s: Screen) => void

/* Rutas con hash → compatibles con GitHub Pages y con el botón “atrás” del celular */
function parse(hash: string): { screen: Screen; conductor: boolean } {
  const p = hash.replace(/^#\/?/, '').split('/')
  if (p[0] === 'itinerario') return { screen: { name: 'itinerary' }, conductor: false }
  if (p[0] === 'marcador') return { screen: { name: 'scoreboard' }, conductor: false }
  if (p[0] === 'ajustes') return { screen: { name: 'settings' }, conductor: false }
  if (p[0] === 'juego' && ALL.some((a) => a.id === p[1])) return { screen: { name: 'activity', id: p[1] }, conductor: p[2] === 'conductor' }
  return { screen: { name: 'home' }, conductor: false }
}
function toHash(s: Screen, conductor = false) {
  switch (s.name) {
    case 'home': return '#/'
    case 'itinerary': return '#/itinerario'
    case 'scoreboard': return '#/marcador'
    case 'settings': return '#/ajustes'
    case 'activity': return `#/juego/${s.id}${conductor ? '/conductor' : ''}`
  }
}

function Shell() {
  const [route, setRoute] = useState(() => parse(location.hash))
  const { progress } = useStore()

  useEffect(() => {
    const on = () => setRoute(parse(location.hash))
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])

  const nav: Nav = useCallback((s) => { location.hash = toHash(s) }, [])
  const pushed = useRef(false)
  const setConductor = (v: boolean) => {
    if (route.screen.name !== 'activity') return
    if (v) { pushed.current = true; location.hash = toHash(route.screen, true) }
    else if (route.conductor) {
      if (pushed.current) { pushed.current = false; history.back() }
      else location.replace(toHash(route.screen))
    }
  }

  const scr = route.screen
  const tab = scr.name === 'activity' ? 'itinerary' : scr.name
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Inicio', go: () => nav({ name: 'home' }) },
    { id: 'itinerary', icon: '🎮', label: 'Itinerario', go: () => nav({ name: 'itinerary' }) },
    { id: 'scoreboard', icon: '🏆', label: 'Marcador', go: () => nav({ name: 'scoreboard' }) },
    { id: 'settings', icon: '⚙️', label: 'Ajustes', go: () => nav({ name: 'settings' }) },
  ]

  return (
    <>
      <PartyBackdrop />
      <main className="mx-auto min-h-[100dvh] max-w-lg px-4 pb-[calc(96px+env(safe-area-inset-bottom))]">
        {scr.name === 'home' && <Home nav={nav} />}
        {scr.name === 'itinerary' && <Itinerary nav={nav} />}
        {scr.name === 'activity' && <ActivityScreen key={scr.id} id={scr.id} conductor={route.conductor} nav={nav} setConductor={setConductor} />}
        {scr.name === 'scoreboard' && <Scoreboard nav={nav} />}
        {scr.name === 'settings' && <Settings nav={nav} />}
      </main>

      {/* Navegación inferior */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-night-950/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl" aria-label="Navegación principal">
        <div className="relative mx-auto grid max-w-lg grid-cols-4">
          <div className="absolute inset-x-0 top-0 h-[2px] bg-white/5"><div className="h-full bg-[linear-gradient(90deg,#ff2bd6,#2fa8ff)] transition-[width] duration-700" style={{ width: `${progress.pct}%` }} /></div>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { buzz(); t.go() }} aria-current={tab === t.id ? 'page' : undefined}
              className={`relative flex h-[72px] flex-col items-center justify-center gap-0.5 text-[11px] font-extrabold transition ${tab === t.id ? 'text-white' : 'text-white/45'}`}>
              <span className={`text-2xl transition-transform ${tab === t.id ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,43,214,.8)]' : ''}`}>{t.icon}</span>
              {t.label}
              {tab === t.id && <span className="absolute bottom-[6px] h-1 w-6 rounded-full bg-fuchsia-neon" />}
            </button>
          ))}
        </div>
      </nav>

      <ConfettiCanvas />
      <CelebrationLayer />
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
