import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import {
  AppState,
  Screen,
  Layout,
  AdminTab,
  User,
  Answer,
  Question,
  CodeChallenge,
  Challenge,
  StudentResult,
} from '../types'
import {
  QUESTIONS,
  CODE_CHALLENGE,
  CHALLENGES,
  RECS,
  DEFAULT_APPROVAL_THRESHOLD,
} from '../data/seed'
import { fetchResults, postResult } from '../utils/api'

interface DB {
  questions: Question[]
  codeChallenge: CodeChallenge
  challenges: Challenge[]
  recs: Record<string, string[]>
  results: StudentResult[]
  approvalThreshold: number
}

const APP_STATE_KEY = 'ddg_app_state'
const RESULTS_KEY = 'ddg_results'

const initialState: AppState = {
  screen: 'login',
  user: null,
  challengeId: null,
  layout: 1,
  currentQ: 0,
  answers: [],
  score: 0,
  codeScore: 0,
  adminTab: 'dashboard',
}

function loadResults(): StudentResult[] {
  try {
    return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveResults(results: StudentResult[]) {
  localStorage.setItem(RESULTS_KEY, JSON.stringify(results))
}

function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(APP_STATE_KEY)
    if (!raw) return initialState
    return { ...initialState, ...JSON.parse(raw) }
  } catch {
    return initialState
  }
}

function saveAppState(state: AppState) {
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(state))
}

const initialDB: DB = {
  questions: QUESTIONS,
  codeChallenge: CODE_CHALLENGE,
  challenges: CHALLENGES,
  recs: RECS,
  results: loadResults(),
  approvalThreshold: DEFAULT_APPROVAL_THRESHOLD,
}

interface AppCtx {
  state: AppState
  db: DB
  setState: (s: Partial<AppState>) => void
  setDB: (d: Partial<DB>) => void
  navigate: (screen: Screen) => void
  login: (user: User) => void
  logout: () => void
  startChallenge: (id: number, layout: Layout) => void
  addAnswer: (a: Answer) => void
  addScore: (n: number) => void
  finalize: () => void
  addResult: (r: StudentResult) => void
  clearResults: () => void
  setAdminTab: (t: AdminTab) => void
}

const Ctx = createContext<AppCtx>(null!)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, _setState] = useState<AppState>(loadAppState)
  const [db, _setDB] = useState<DB>(initialDB)

  useEffect(() => {
    saveAppState(state)
  }, [state])

  useEffect(() => {
    fetchResults()
      .then((results) => {
        _setDB((prev) => ({ ...prev, results }))
        saveResults(results)
      })
      .catch(() => undefined)
  }, [])

  const setState = useCallback((s: Partial<AppState>) => {
    _setState((prev) => ({ ...prev, ...s }))
  }, [])

  const setDB = useCallback((d: Partial<DB>) => {
    _setDB((prev) => ({ ...prev, ...d }))
  }, [])

  const navigate = (screen: Screen) => setState({ screen })
  const setAdminTab = (adminTab: AdminTab) => setState({ adminTab })

  const login = (user: User) => {
    const isAdmin = user.email.toLowerCase() === 'nazyalmeida@gmail.com'

    setState({
      user,
      screen: isAdmin ? 'admin' : 'select',
      adminTab: 'dashboard',
    })
  }

  const logout = () => {
    localStorage.removeItem(APP_STATE_KEY)
    _setState(initialState)
  }

  const startChallenge = (id: number, layout: Layout) => {
    setState({
      challengeId: id,
      layout,
      currentQ: 0,
      answers: [],
      score: 0,
      codeScore: 0,
      screen: 'challenge',
    })
  }

  const addAnswer = (a: Answer) => {
    _setState((prev) => ({ ...prev, answers: [...prev.answers, a] }))
  }

  const addScore = (n: number) => {
    _setState((prev) => ({ ...prev, score: prev.score + n }))
  }

  const addResult = (r: StudentResult) => {
    const results = [...db.results, r]
    setDB({ results })
    saveResults(results)
  }

  const clearResults = () => {
    setDB({ results: [] })
    saveResults([])
  }

  const finalize = () => {
    const cats: Record<string, { c: number; t: number }> = {}

    state.answers.forEach((a) => {
      if (!cats[a.category]) cats[a.category] = { c: 0, t: 0 }
      cats[a.category].t++
      if (a.correct) cats[a.category].c++
    })

    const pct = Math.round((state.score / 7) * 100)

    const result: StudentResult = {
      id: Date.now(),
      name: state.user!.name,
      email: state.user!.email,
      score: state.score,
      max: 7,
      passed: pct >= db.approvalThreshold,
      cats,
      ts: Date.now(),
    }

    addResult(result)
    postResult({
      name: result.name,
      email: result.email,
      score: result.score,
      max: result.max,
      passed: result.passed,
      cats: result.cats,
    }).catch(() => undefined)

    window.dispatchEvent(new Event('ddg:update'))
    setState({ screen: 'result' })
  }

  return (
    <Ctx.Provider
      value={{
        state,
        db,
        setState,
        setDB,
        navigate,
        login,
        logout,
        startChallenge,
        addAnswer,
        addScore,
        finalize,
        addResult,
        clearResults,
        setAdminTab,
      }}
    >
      {children}
    </Ctx.Provider>
  )
}
