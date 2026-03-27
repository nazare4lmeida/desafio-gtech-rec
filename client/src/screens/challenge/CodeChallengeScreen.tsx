import { useState } from 'react'
import { useApp } from '../../hooks/useAppStore'
import { runCodeTests } from '../../utils/helpers'
import { CodeTestResult } from '../../types'
import CodeEditor from '../../components/CodeEditor'
import DiffTag from '../../components/DiffTag'

interface Props {
  onToast: (msg: string) => void
}

export default function CodeChallengeScreen({ onToast }: Props) {
  const { db, state, addAnswer, addScore, finalize } = useApp()
  const [code, setCode]         = useState('')
  const [running, setRunning]   = useState(false)
  const [results, setResults]   = useState<CodeTestResult[] | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const run = () => {
    setRunning(true)
    setTimeout(() => {
      const res = runCodeTests(code, db.codeChallenge.tests)
      setResults(res)
      const passing = res.filter(r => r.pass).length
      const codeScore = passing === 3 ? 2 : passing > 0 ? 1 : 0
      addScore(codeScore)
      addAnswer({ qid: 6, category: 'lógica', correct: passing === 3, codeResults: res })
      setSubmitted(true)
      setRunning(false)
      if (passing === 3) setTimeout(finalize, 1600)
    }, 600)
  }

  const inner = (
    <>
      <p className="font-mono text-[.68rem] tracking-[1.5px] uppercase text-blue mb-2">
        Desafio Final · Código
      </p>
      <DiffTag d="beginner+" />
      <p
        className="text-[1.05rem] font-semibold text-navy leading-[1.55] mt-3 mb-3"
        dangerouslySetInnerHTML={{ __html: db.codeChallenge.statement }}
      />
      <p className="text-[.77rem] text-muted mb-3 flex items-center gap-1">
        <span>⚠️</span>
        <span>Ctrl+C / Ctrl+V / clique direito desabilitados nesta tela.</span>
      </p>

      <CodeEditor
        value={code}
        onChange={setCode}
        onBlockAttempt={() => onToast('⚠️ Copiar/colar desabilitado!')}
      />

      {results && (
        <div className="mt-3">
          <p className="text-[.72rem] font-bold uppercase tracking-[1.5px] text-muted mb-2">Testes</p>
          <div className="flex flex-col gap-1.5">
            {results.map((r, i) => (
              <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.78rem] font-mono border animate-reveal
                ${r.pass
                  ? 'bg-green-bg border-[#A8D9BE] text-green'
                  : 'bg-red-bg border-[#F0AAAA] text-red'}`}>
                <span>{r.pass ? '✅' : '❌'}</span>
                <span>{r.label}</span>
                {!r.pass && (
                  <span className="ml-auto text-[.7rem] opacity-75">obtido: {String(r.got)}</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-[.83rem] text-muted mt-2">
            {results.every(r => r.pass)
              ? '🎉 Todos os testes passaram! +2 pontos'
              : results.some(r => r.pass)
              ? '⚡ Parcialmente correto +1 ponto'
              : '💡 Nenhum teste passou.'}
          </p>
        </div>
      )}

      <div className="flex gap-3 justify-end mt-5">
        {submitted && !results?.every(r => r.pass) && (
          <button
            onClick={finalize}
            className="px-5 py-2.5 border-[1.5px] border-navy text-navy font-semibold rounded-xl text-[.88rem] hover:bg-navy hover:text-white transition-all"
          >
            Finalizar mesmo assim
          </button>
        )}
        <button
          onClick={run}
          disabled={running || submitted}
          className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-[.88rem] hover:bg-navy active:scale-[.97] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {running
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Executando...</>
            : '▶ Executar e Enviar'}
        </button>
      </div>
    </>
  )

  if (state.layout === 3) return (
    <div className="w-full max-w-[640px] animate-fade-up">
      <div className="rounded-card overflow-hidden" style={{ background: '#1E3A5F', boxShadow: '0 0 0 1px rgba(168,197,224,.2), 0 20px 60px rgba(30,58,95,.35)' }}>
        <div className="flex items-center gap-2 px-5 py-3 border-b border-sky/10" style={{ background: '#162d4a' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" /><span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" /><span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="font-mono text-[.7rem] text-sky/50 ml-2">devdeskgame — desafio de código</span>
        </div>
        <div className="p-7 text-white">{inner}</div>
      </div>
    </div>
  )

  if (state.layout === 2) return (
    <div className="w-full max-w-[860px] animate-fade-up grid grid-cols-[200px_1fr] gap-5 items-start">
      <div className="bg-navy rounded-[14px] p-5 sticky top-20">
        <h4 className="font-display text-[.85rem] text-sky mb-4 uppercase tracking-wide">Progresso</h4>
        <div className="flex flex-col gap-2">
          {[1,2,3,4,5].map(n => (
            <div key={n} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.78rem] text-sky bg-sky/10">
              <div className="w-2 h-2 rounded-full bg-sky flex-shrink-0" /><span>✓ Q{n}</span>
            </div>
          ))}
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.78rem] text-white bg-blue">
            <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" /><span>Código</span>
          </div>
        </div>
      </div>
      <div className="bg-surface rounded-[14px] border border-border shadow-card-lg p-8">{inner}</div>
    </div>
  )

  return (
    <div className="w-full max-w-[580px] animate-fade-up">
      <div className="bg-surface rounded-card border border-border shadow-card-lg p-10">{inner}</div>
    </div>
  )
}
