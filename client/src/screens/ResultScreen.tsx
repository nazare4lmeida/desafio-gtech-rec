import { useApp } from '../hooks/useAppStore'
import { pct } from '../utils/helpers'

export default function ResultScreen({ onToast }: { onToast: (msg: string) => void }) {
  const { state, db, setState } = useApp()
  const p = pct(state.score, 7)
  const passed = p >= db.approvalThreshold

  // Build category breakdown
  const cats: Record<string, { c: number; t: number }> = {}
  state.answers.forEach(a => {
    if (!cats[a.category]) cats[a.category] = { c: 0, t: 0 }
    cats[a.category].t++
    if (a.correct) cats[a.category].c++
  })

  const sorted = Object.entries(cats).sort((a, b) => (a[1].c / a[1].t) - (b[1].c / b[1].t))
  const worst  = sorted.slice(0, 2).map(([c]) => c)
  const recs   = worst.flatMap(c => (db.recs[c] || []).slice(0, 2))

  const shareText = `🎮 Desafio GtechRecupera — ${state.user!.name}\n📊 ${state.score}/7 (${p}%) — ${passed ? '✅ Aprovado' : '❌ Reprovado'}\n\nAcesse e teste seus conhecimentos!`

  const handleShare = () => {
    navigator.clipboard.writeText(shareText)
      .then(() => onToast('✅ Resultado copiado!'))
      .catch(() => onToast('❌ Não foi possível copiar.'))
  }

  return (
    <div className="w-full max-w-[540px] animate-scale-in">
      <div className="bg-surface rounded-card border border-border shadow-card-lg p-10">
        {/* Score ring */}
        <div className="text-center pb-2">
          <div className={`w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center mx-auto mb-4
            ${passed ? 'border-green bg-green-bg' : 'border-red bg-red-bg'}`}>
            <span className={`font-mono text-[1.9rem] font-bold ${passed ? 'text-green' : 'text-red'}`}>{p}%</span>
            <span className={`text-[.65rem] font-bold uppercase tracking-wide ${passed ? 'text-green' : 'text-red'}`}>
              {state.score}/7
            </span>
          </div>

          <span className={`inline-block px-5 py-1 rounded-full font-bold text-[.84rem] uppercase tracking-wide
            ${passed ? 'bg-green-bg text-green' : 'bg-red-bg text-red'}`}>
            {passed ? '✅ Aprovado' : '❌ Reprovado'}
          </span>

          <p className="text-[1rem] font-semibold text-navy mt-2">{state.user!.name}</p>
          <p className="text-[.8rem] text-muted">
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="h-px bg-border my-5" />

        {/* Category breakdown */}
        <p className="text-[.72rem] font-bold uppercase tracking-[1.5px] text-muted mb-3">
          📊 Desempenho por Categoria
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {Object.entries(cats).map(([cat, v]) => {
            const cp = pct(v.c, v.t)
            return (
              <div key={cat} className="bg-[#EFF4FA] rounded-xl p-3">
                <div className="flex justify-between items-center">
                  <span className="text-[.75rem] font-semibold text-slate capitalize">{cat}</span>
                  <span className="text-[.7rem] text-muted">{cp}%</span>
                </div>
                <div className="h-1 bg-border rounded-full overflow-hidden my-1.5">
                  <div
                    className="h-full bg-blue rounded-full transition-[width] duration-700"
                    style={{ width: `${cp}%` }}
                  />
                </div>
                <div className="text-[.7rem] text-muted">{v.c}/{v.t} corretas</div>
              </div>
            )
          })}
        </div>

        {/* Recommendations */}
        {recs.length > 0 && (
          <>
            <p className="text-[.72rem] font-bold uppercase tracking-[1.5px] text-muted mt-5 mb-3">
              💡 Recomendações de Estudo
            </p>
            <div className="flex flex-col gap-2">
              {recs.map((r, i) => (
                <div key={i} className="flex gap-2 p-2.5 bg-[#EFF4FA] rounded-lg text-[.83rem] text-slate">
                  <span>📌</span><span>{r}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-center flex-wrap mt-7">
          <button
            onClick={() => setState({ currentQ: 0, answers: [], score: 0, codeScore: 0, screen: 'select' })}
            className="px-6 py-2.5 border-[1.5px] border-navy text-navy font-semibold rounded-xl text-[.88rem] hover:bg-navy hover:text-white transition-all"
          >
            ↩ Novo Desafio
          </button>
          <button
            onClick={handleShare}
            className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-[.88rem] hover:bg-navy active:scale-[.97] transition-all"
          >
            📤 Compartilhar
          </button>
        </div>
      </div>
    </div>
  )
}
