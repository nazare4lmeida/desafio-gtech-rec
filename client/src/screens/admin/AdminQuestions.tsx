import { useState } from 'react'
import { useApp } from '../../hooks/useAppStore'
import { Question } from '../../types'

const LETTERS = ['A', 'B', 'C', 'D']

export default function AdminQuestions({ onToast }: { onToast: (msg: string) => void }) {
  const { db, setDB } = useApp()
  const [open, setOpen] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, Question>>({})

  const getDraft = (q: Question): Question => drafts[q.id] ?? { ...q, options: [...q.options] }

  const updateDraft = (id: number, patch: Partial<Question>) => {
    setDrafts(p => ({ ...p, [id]: { ...getDraft(db.questions.find(q => q.id === id)!), ...patch } }))
  }

  const updateOption = (qid: number, j: number, val: string) => {
    const q = getDraft(db.questions.find(q => q.id === qid)!)
    const opts = [...q.options]; opts[j] = val
    updateDraft(qid, { options: opts })
  }

  const save = (qid: number) => {
    const draft = drafts[qid]
    if (!draft) return
    setDB({ questions: db.questions.map(q => q.id === qid ? draft : q) })
    setOpen(null)
    onToast('✅ Questão salva!')
  }

  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-[1.3rem] font-extrabold text-navy">Editor de Questões</h2>
      <p className="text-[.83rem] text-muted mb-6">Clique em uma questão para editar.</p>

      <div className="flex flex-col gap-3">
        {db.questions.map((q, i) => {
          const draft   = getDraft(q)
          const isOpen  = open === q.id
          return (
            <div key={q.id} className={`bg-surface border-[1.5px] rounded-xl transition-all ${isOpen ? 'border-blue shadow-card' : 'border-border'}`}>
              {/* Header */}
              <div
                className="flex items-center gap-3 p-4 cursor-pointer"
                onClick={() => setOpen(isOpen ? null : q.id)}
              >
                <div className="w-7 h-7 bg-[#EEF3FA] text-blue rounded-md flex items-center justify-center text-[.7rem] font-bold font-mono flex-shrink-0">
                  {i + 1}
                </div>
                <p className="text-[.87rem] font-medium text-text flex-1 truncate max-w-[420px]"
                  dangerouslySetInnerHTML={{ __html: q.text }} />
                <div className="flex gap-1.5 ml-auto flex-shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[.68rem] font-bold uppercase
                    ${q.difficulty==='beginner'?'bg-green-bg text-green':q.difficulty==='intermediate'?'bg-gold-bg text-gold':'bg-red-bg text-red'}`}>
                    {q.difficulty}
                  </span>
                  <span className="px-2 py-0.5 bg-[#e4eaee] text-slate rounded-full text-[.68rem] font-bold">{q.category}</span>
                </div>
                <span className={`text-muted ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
              </div>

              {/* Form */}
              {isOpen && (
                <div className="px-5 pb-5 border-t border-border pt-4 animate-reveal">
                  <div className="mb-4">
                    <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Enunciado</label>
                    <input type="text" value={draft.text}
                      onChange={e => updateDraft(q.id, { text: e.target.value })}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-border rounded-xl text-[.88rem] font-sans outline-none focus:border-blue" />
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Dificuldade</label>
                      <select value={draft.difficulty} onChange={e => updateDraft(q.id, { difficulty: e.target.value as Question['difficulty'] })}
                        className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-xl text-[.88rem] font-sans outline-none focus:border-blue">
                        <option value="beginner">Principiante</option>
                        <option value="intermediate">Intermediário</option>
                        <option value="hard">Difícil</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Categoria</label>
                      <select value={draft.category} onChange={e => updateDraft(q.id, { category: e.target.value as Question['category'] })}
                        className="w-full px-3 py-2.5 border-[1.5px] border-border rounded-xl text-[.88rem] font-sans outline-none focus:border-blue">
                        {['frontend','backend','lógica','geral'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <label className="block text-[.8rem] font-semibold text-slate mb-2">Opções (selecione a correta)</label>
                  {draft.options.map((opt, j) => (
                    <div key={j} className="flex items-center gap-2.5 mb-2">
                      <input type="radio" name={`correct-${q.id}`} checked={draft.correct === j}
                        onChange={() => updateDraft(q.id, { correct: j })}
                        className="accent-blue w-4 h-4 flex-shrink-0 cursor-pointer" />
                      <span className="font-mono text-[.75rem] font-bold text-muted w-5">{LETTERS[j]}</span>
                      <input type="text" value={opt} onChange={e => updateOption(q.id, j, e.target.value)}
                        className="flex-1 px-3 py-2 border-[1.5px] border-border rounded-lg text-[.85rem] font-sans outline-none focus:border-blue" />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div>
                      <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Feedback Correto</label>
                      <textarea value={draft.feedbackOk} rows={2}
                        onChange={e => updateDraft(q.id, { feedbackOk: e.target.value })}
                        className="w-full px-3 py-2 border-[1.5px] border-border rounded-xl text-[.83rem] font-sans outline-none focus:border-blue resize-none" />
                    </div>
                    <div>
                      <label className="block text-[.8rem] font-semibold text-slate mb-1.5">Feedback Incorreto</label>
                      <textarea value={draft.feedbackNok} rows={2}
                        onChange={e => updateDraft(q.id, { feedbackNok: e.target.value })}
                        className="w-full px-3 py-2 border-[1.5px] border-border rounded-xl text-[.83rem] font-sans outline-none focus:border-blue resize-none" />
                    </div>
                  </div>

                  <div className="flex gap-2.5 justify-end mt-4">
                    <button onClick={() => setOpen(null)}
                      className="px-4 py-2 border border-border text-muted rounded-xl text-[.82rem] font-semibold hover:border-blue hover:text-blue transition-all">
                      Cancelar
                    </button>
                    <button onClick={() => save(q.id)}
                      className="px-4 py-2 bg-green text-white rounded-xl text-[.82rem] font-semibold hover:bg-[#1e5c34] transition-all">
                      💾 Salvar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
