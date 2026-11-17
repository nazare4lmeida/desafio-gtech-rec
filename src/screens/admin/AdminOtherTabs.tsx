import { useState } from 'react'
import { useApp } from '../../hooks/useAppStore'
import { TestCase } from '../../types'

// ── Code Challenge Editor ──────────────────────────────────
export function AdminCode({ onToast }: { onToast: (msg: string) => void }) {
  const { db, setDB } = useApp()
  const [stmt, setStmt]   = useState(db.codeChallenge.statement)
  const [tests, setTests] = useState<TestCase[]>(db.codeChallenge.tests.map(t => ({ ...t, input: [...t.input] })))

  const updateTest = (i: number, field: 'input' | 'expected', val: string) => {
    const next = tests.map((t, j) => {
      if (j !== i) return t
      if (field === 'input') {
        try { return { ...t, input: JSON.parse(val) } } catch { return t }
      }
      return { ...t, expected: Number(val) }
    })
    setTests(next)
  }

  const save = () => {
    setDB({ codeChallenge: { statement: stmt, tests } })
    onToast('✅ Desafio de código salvo!')
  }

  return (
    <div className="animate-fade-up max-w-[700px]">
      <h2 className="font-display text-[1.3rem] font-extrabold text-navy">Editor: Desafio de Código</h2>
      <p className="text-[.83rem] text-muted mb-6">Edite o enunciado e os casos de teste.</p>

      <div className="bg-surface rounded-[14px] border border-border shadow-card p-6">
        <div className="mb-5">
          <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Enunciado (HTML permitido)</label>
          <textarea value={stmt} onChange={e => setStmt(e.target.value)} rows={4}
            className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-xl text-[.88rem] font-sans outline-none focus:border-blue resize-y" />
        </div>

        <label className="block text-[.8rem] font-semibold text-slate mb-3">Casos de Teste</label>
        {tests.map((t, i) => (
          <div key={i} className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[.75rem] text-muted mb-1">Input (array JSON)</label>
              <input type="text" defaultValue={JSON.stringify(t.input)}
                onChange={e => updateTest(i, 'input', e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-border rounded-xl text-[.85rem] font-mono outline-none focus:border-blue" />
            </div>
            <div>
              <label className="block text-[.75rem] text-muted mb-1">Esperado</label>
              <input type="number" defaultValue={t.expected}
                onChange={e => updateTest(i, 'expected', e.target.value)}
                className="w-full px-3 py-2 border-[1.5px] border-border rounded-xl text-[.85rem] font-mono outline-none focus:border-blue" />
            </div>
          </div>
        ))}

        <button onClick={save}
          className="mt-2 px-5 py-2.5 bg-green text-white font-semibold rounded-xl text-[.88rem] hover:bg-[#1e5c34] transition-all">
          💾 Salvar Desafio
        </button>
      </div>
    </div>
  )
}

// ── Recommendations Editor ──────────────────────────────────
export function AdminRecs({ onToast }: { onToast: (msg: string) => void }) {
  const { db, setDB } = useApp()
  const [drafts, setDrafts] = useState<Record<string, string[]>>(
    Object.fromEntries(Object.entries(db.recs).map(([k, v]) => [k, [...v]]))
  )

  const updateRec = (cat: string, i: number, val: string) => {
    setDrafts(p => ({ ...p, [cat]: p[cat].map((r, j) => j === i ? val : r) }))
  }

  const save = (cat: string) => {
    setDB({ recs: { ...db.recs, [cat]: drafts[cat] } })
    onToast('✅ Recomendações salvas!')
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-[1.3rem] font-extrabold text-navy">Recomendações de Estudo</h2>
      <p className="text-[.83rem] text-muted mb-6">Textos exibidos na tela de resultado final.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px]">
        {Object.entries(drafts).map(([cat, items]) => (
          <div key={cat} className="bg-surface rounded-[14px] border border-border shadow-card p-5">
            <p className="text-[.88rem] font-bold text-navy mb-4 capitalize">📚 {cat}</p>
            {items.map((r, i) => (
              <div key={i} className="mb-2.5">
                <input type="text" value={r} onChange={e => updateRec(cat, i, e.target.value)}
                  className="w-full px-3 py-2 border-[1.5px] border-border rounded-lg text-[.83rem] font-sans outline-none focus:border-blue" />
              </div>
            ))}
            <button onClick={() => save(cat)}
              className="mt-1 px-4 py-2 bg-green text-white rounded-xl text-[.78rem] font-semibold hover:bg-[#1e5c34] transition-all">
              💾 Salvar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Challenges Manager ──────────────────────────────────────
export function AdminChallenges({ onToast }: { onToast: (msg: string) => void }) {
  const { db, setDB } = useApp()
  const [titles, setTitles] = useState<Record<number, string>>(
    Object.fromEntries(db.challenges.map(c => [c.id, c.title]))
  )

  const toggleActive = (id: number) => {
    setDB({ challenges: db.challenges.map(c => c.id === id ? { ...c, active: !c.active } : c) })
    const c = db.challenges.find(x => x.id === id)!
    onToast(c.active ? '⚠️ Desafio desativado.' : '✅ Desafio ativado.')
  }

  const saveTitle = (id: number) => {
    setDB({ challenges: db.challenges.map(c => c.id === id ? { ...c, title: titles[id] } : c) })
    onToast('✅ Desafio atualizado!')
  }

  return (
    <div className="animate-fade-up max-w-[600px]">
      <h2 className="font-display text-[1.3rem] font-extrabold text-navy">Gerenciar Desafios</h2>
      <p className="text-[.83rem] text-muted mb-6">Ative/desative e renomeie os desafios.</p>

      <div className="flex flex-col gap-3">
        {db.challenges.map(c => (
          <div key={c.id} className="bg-surface rounded-[14px] border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[.88rem] font-semibold text-text">{c.title}</p>
                <p className="text-[.75rem] text-muted">{c.desc} · Layout {c.layout}</p>
              </div>
              <label className="relative w-10 h-[22px] flex-shrink-0">
                <input type="checkbox" checked={c.active} onChange={() => toggleActive(c.id)} className="opacity-0 w-0 h-0" />
                <span className="toggle-slider" />
              </label>
            </div>
            <div className="flex gap-2">
              <input type="text" value={titles[c.id]} onChange={e => setTitles(p => ({ ...p, [c.id]: e.target.value }))}
                className="flex-1 px-3 py-2 border-[1.5px] border-border rounded-lg text-[.83rem] font-sans outline-none focus:border-blue" />
              <button onClick={() => saveTitle(c.id)}
                className="px-3.5 py-2 bg-green text-white rounded-lg text-[.78rem] font-semibold hover:bg-[#1e5c34] transition-all">
                💾
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Config ──────────────────────────────────────────────────
export function AdminConfig({ onToast }: { onToast: (msg: string) => void }) {
  const { db, setDB } = useApp()
  const [threshold, setThreshold] = useState(String(db.approvalThreshold))

  const save = () => {
    const v = parseInt(threshold)
    if (isNaN(v) || v < 0 || v > 100) { onToast('⚠️ Valor inválido (0–100).'); return }
    setDB({ approvalThreshold: v })
    onToast(`✅ Critério de aprovação: ${v}%`)
  }

  return (
    <div className="animate-fade-up max-w-[500px]">
      <h2 className="font-display text-[1.3rem] font-extrabold text-navy">Configurações</h2>
      <p className="text-[.83rem] text-muted mb-6">Ajuste os parâmetros da plataforma.</p>

      <div className="bg-surface rounded-[14px] border border-border shadow-card p-6 mb-4">
        <div className="flex items-center justify-between py-3 border-b border-border mb-4">
          <div>
            <p className="text-[.88rem] font-medium text-text">Critério de Aprovação</p>
            <p className="text-[.75rem] text-muted">Porcentagem mínima para ser aprovado</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={threshold} min={0} max={100}
              onChange={e => setThreshold(e.target.value)}
              className="w-16 px-2.5 py-2 border-[1.5px] border-border rounded-lg text-[.88rem] font-mono outline-none focus:border-blue text-center" />
            <span className="text-[.88rem] text-muted">%</span>
          </div>
        </div>
        <button onClick={save}
          className="px-5 py-2.5 bg-green text-white font-semibold rounded-xl text-[.88rem] hover:bg-[#1e5c34] transition-all">
          💾 Salvar Configurações
        </button>
      </div>

      <div className="bg-surface rounded-[14px] border-[1.5px] border-red shadow-card p-6">
        <p className="text-[.88rem] font-semibold text-red mb-1">⚠️ Gerenciamento de exclusão</p>
        <p className="text-[.82rem] text-muted mb-4">
          A exclusão em massa agora é seletiva. Use a aba <strong>Resultados</strong> para marcar apenas os registros que deseja remover.
        </p>
        <button onClick={() => onToast('➡️ Vá para a aba Resultados para excluir itens selecionados.')}
          className="px-5 py-2.5 bg-red text-white font-semibold rounded-xl text-[.88rem] hover:bg-[#8a2020] transition-all">
          Selecionar itens para excluir
        </button>
      </div>


    </div>
  )
}
