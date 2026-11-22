export type TeamId = 'estefany' | 'antonio'
export type GenderId = 'mujeres' | 'hombres'

/** Modalidad de competencia de un juego */
export type Mode = 'teams' | 'gender' | 'individual' | 'pairs' | 'none'

/** Tipo de paso del modo conductor */
export type StepKind = 'say' | 'do' | 'music' | 'rule'

/** Indicación musical */
export type MusicCue = 'prepare' | 'play' | 'stop' | 'down' | 'up' | 'romantic' | 'perreo' | 'suspense'

export interface Step {
  kind: StepKind
  title: string
  /** Instrucción clara (lo que se hace) */
  text?: string
  /** Texto exacto para leer en voz alta */
  speech?: string[]
  cue?: MusicCue
  /** Paso especial con componente interactivo */
  special?: 'result' | 'questions' | 'hype' | 'timer' | 'awards' | 'finale'
}

export type ActivityKind = 'ceremony' | 'game' | 'break' | 'couple' | 'awards' | 'finale' | 'wildcard'

export interface Activity {
  id: string
  stage: number | string
  emoji: string
  title: string
  tagline: string
  kind: ActivityKind
  durationMin: number
  participants: string
  /** Modalidad por defecto (se puede cambiar al registrar) */
  defaultMode: Mode
  /** ¿Suma puntos? */
  competitive: boolean
  materials: string[]
  setup: string[]
  organizer: string[]
  /** Discurso de presentación */
  intro: string[]
  /** Explicación verbal de las reglas */
  rulesSpeech: string[]
  rules: string[]
  /** Resumen musical (aparece también paso a paso en el guion) */
  music: string
  hype: string[]
  winnerHow: string
  winnerSpeech: string[]
  transition: string
  safety?: string[]
  flow: Step[]
  questions?: string[]
}

export interface Result {
  mode: Mode
  /** Ganador en teams/gender, o equipo asignado en individual/pairs */
  winner: TeamId | GenderId | 'tie' | null
  name?: string
  assignTeam?: TeamId | null
  at: number
}

export type Status = 'pending' | 'active' | 'done' | 'skipped'

export interface Scoring {
  win: number
  lose: number
  tie: number
}
