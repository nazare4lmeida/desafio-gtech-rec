import { useEffect, useRef, useState } from 'react'
import { useApp } from '../hooks/useAppStore'
import { pct } from '../utils/helpers'

const MAX = 7

export default function ProgressStrip() {
  const { state } = useApp()
  const show = state.screen === 'challenge'
  const p = pct(state.score, MAX)
  const fillRef = useRef<HTMLDivElement>(null)
  const [pulse, setPulse] = useState(false)
  const prevScore = useRef(state.score)

  useEffect(() => {
    if (state.score !== prevScore.current) {
      prevScore.current = state.score
      setPulse(true)
      setTimeout(() => setPulse(false), 700)
    }
  }, [state.score])

  if (!show) return null

  const stepLabel = state.currentQ < 5
    ? `Questão ${state.currentQ + 1} de 6`
    : 'Desafio de Código'

  return (
    <div className="flex items-center gap-4 px-7 py-2.5 bg-surface border-b border-border text-[.8rem]">
      <span className="font-bold text-navy whitespace-nowrap font-mono">
        {state.score}/7 pts
      </span>

      <div className="flex-1 h-[7px] bg-border rounded-full overflow-hidden">
        <div
          ref={fillRef}
          className={`h-full rounded-full bg-gradient-to-r from-blue to-sky transition-[width] duration-500 ease-out ${pulse ? 'animate-pulse-bar' : ''}`}
          style={{ width: `${p}%` }}
        />
      </div>

      <span className="font-bold text-navy whitespace-nowrap">{p}%</span>
      <span className="text-muted whitespace-nowrap hidden sm:block">{stepLabel}</span>
    </div>
  )
}
