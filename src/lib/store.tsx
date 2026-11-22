import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { Result, Scoring, Status, TeamId } from '../data/types'
import { ACTIVITIES, REQUIRED_FOR_AWARDS } from '../data/games'

export type Screen =
  | { name: 'home' }
  | { name: 'itinerary' }
  | { name: 'activity'; id: string }
  | { name: 'scoreboard' }
  | { name: 'settings' }

export interface TimerState { elapsed: number; startedAt: number | null }

export interface AppState {
  v: 1
  statuses: Record<string, Status>
  results: Record<string, Result>
  timers: Record<string, TimerState>
  conductorStep: Record<string, number>
  questionIdx: number
  currentId: string | null
  scoring: Scoring
  fontScale: number
  tiebreak: TeamId | null
  championAnnounced: boolean
  partyStarted: boolean
  team: { estefany: string[]; antonio: string[] }
}

const KEY = 'despedida-ae-v1'

const initial: AppState = {
  v: 1,
  statuses: {},
  results: {},
  timers: {},
  conductorStep: {},
  questionIdx: 0,
  currentId: null,
  scoring: { win: 3, lose: 1, tie: 2 },
  fontScale: 1,
  tiebreak: null,
  championAnnounced: false,
  partyStarted: false,
  team: { estefany: [], antonio: [] },
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initial
    const parsed = JSON.parse(raw)
    return { ...initial, ...parsed, scoring: { ...initial.scoring, ...(parsed.scoring || {}) } }
  } catch {
    return initial
  }
}

type Action =
  | { type: 'status'; id: string; status: Status }
  | { type: 'result'; id: string; result: Result | null }
  | { type: 'timer'; id: string; timer: TimerState }
  | { type: 'step'; id: string; step: number }
  | { type: 'question'; idx: number }
  | { type: 'current'; id: string | null }
  | { type: 'scoring'; scoring: Scoring }
  | { type: 'font'; scale: number }
  | { type: 'tiebreak'; team: TeamId | null }
  | { type: 'champion'; value: boolean }
  | { type: 'party'; value: boolean }
  | { type: 'reset' }

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'status': return { ...s, statuses: { ...s.statuses, [a.id]: a.status } }
    case 'result': {
      // Un único resultado por juego: corregir reemplaza, nunca duplica puntos
      const results = { ...s.results }
      if (a.result) results[a.id] = a.result
      else delete results[a.id]
      return { ...s, results, tiebreak: null, championAnnounced: false }
    }
    case 'timer': return { ...s, timers: { ...s.timers, [a.id]: a.timer } }
    case 'step': return { ...s, conductorStep: { ...s.conductorStep, [a.id]: a.step } }
    case 'question': return { ...s, questionIdx: a.idx }
    case 'current': return { ...s, currentId: a.id }
    case 'scoring': return { ...s, scoring: a.scoring, tiebreak: null, championAnnounced: false }
    case 'font': return { ...s, fontScale: a.scale }
    case 'tiebreak': return { ...s, tiebreak: a.team }
    case 'champion': return { ...s, championAnnounced: a.value }
    case 'party': return { ...s, partyStarted: a.value }
    case 'reset': return { ...initial, fontScale: s.fontScale, scoring: s.scoring }
  }
}

/* ───────── Puntuación (derivada SIEMPRE de los resultados → sin duplicados) ───────── */
export interface Board { estefany: number; antonio: number; winsE: number; winsA: number; ties: number }
export interface GBoard { mujeres: number; hombres: number; winsM: number; winsH: number; ties: number }

export function computeScores(results: Record<string, Result>, statuses: Record<string, Status>, sc: Scoring) {
  const teams: Board = { estefany: 0, antonio: 0, winsE: 0, winsA: 0, ties: 0 }
  const gender: GBoard = { mujeres: 0, hombres: 0, winsM: 0, winsH: 0, ties: 0 }
  for (const [id, r] of Object.entries(results)) {
    if (statuses[id] === 'skipped') continue
    if (r.mode === 'teams' || ((r.mode === 'individual' || r.mode === 'pairs') && r.assignTeam)) {
      const w = r.mode === 'teams' ? r.winner : r.assignTeam
      if (w === 'tie') { teams.estefany += sc.tie; teams.antonio += sc.tie; teams.ties++ }
      else if (w === 'estefany') { teams.estefany += sc.win; teams.antonio += sc.lose; teams.winsE++ }
      else if (w === 'antonio') { teams.antonio += sc.win; teams.estefany += sc.lose; teams.winsA++ }
    } else if (r.mode === 'gender') {
      if (r.winner === 'tie') { gender.mujeres += sc.tie; gender.hombres += sc.tie; gender.ties++ }
      else if (r.winner === 'mujeres') { gender.mujeres += sc.win; gender.hombres += sc.lose; gender.winsM++ }
      else if (r.winner === 'hombres') { gender.hombres += sc.win; gender.mujeres += sc.lose; gender.winsH++ }
    }
  }
  return { teams, gender }
}

/* ───────── Contexto ───────── */
interface Ctx {
  s: AppState
  d: React.Dispatch<Action>
  scores: ReturnType<typeof computeScores>
  awardsUnlocked: boolean
  progress: { done: number; total: number; pct: number }
  nextId: string | null
  isClosed: (id: string) => boolean
}
const StoreCtx = createContext<Ctx | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, d] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* almacenamiento no disponible */ }
  }, [s])

  const isClosed = useCallback((id: string) => s.statuses[id] === 'done' || s.statuses[id] === 'skipped', [s.statuses])

  const value = useMemo<Ctx>(() => {
    const scores = computeScores(s.results, s.statuses, s.scoring)
    const awardsUnlocked = REQUIRED_FOR_AWARDS.every(isClosed)
    const done = ACTIVITIES.filter((a) => isClosed(a.id)).length
    const total = ACTIVITIES.length
    const next = ACTIVITIES.find((a) => !isClosed(a.id))
    return { s, d, scores, awardsUnlocked, progress: { done, total, pct: Math.round((done / total) * 100) }, nextId: next?.id ?? null, isClosed }
  }, [s, isClosed])

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('useStore fuera de StoreProvider')
  return c
}

/** Vibración corta (si el celular lo soporta) */
export const buzz = (ms: number | number[] = 12) => { try { navigator.vibrate?.(ms) } catch { /* */ } }
