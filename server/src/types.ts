export type Difficulty = 'beginner' | 'beginner+' | 'intermediate' | 'hard'
export type Category   = 'frontend' | 'backend' | 'lógica' | 'geral'

export interface Question {
  id: number
  order: number
  difficulty: Difficulty
  category: Category
  text: string
  options: string[]
  correct: number
  feedbackOk: string
  feedbackNok: string
}

export interface CategoryScore { c: number; t: number }

export interface StudentResult {
  id: number
  name: string
  email: string
  score: number
  max: number
  passed: boolean
  cats: Record<string, CategoryScore>
  ts: number
}

export interface RecoveryResult {
  id: number
  name: string
  email: string
  score: number
  passed: boolean
  ts: number
  projectScore?: number
  bestScore?: number
}

export interface PresencaResult {
  id: number
  name: string
  email: string
  presencaPct: number
  ts: number
  previousPct?: number
  challengePct?: number
}

export interface PersistedDB {
  results: StudentResult[]
  recoveryResults: RecoveryResult[]
  presencaResults: PresencaResult[]
  questions: Question[]
}

export interface AdminResultRow {
  id: number
  name: string
  email: string
  score: number
  max: number
  passed: boolean
  ts: number
  module: 'fullstack' | 'recuperacao' | 'presenca'
  moduleLabel: string
}
