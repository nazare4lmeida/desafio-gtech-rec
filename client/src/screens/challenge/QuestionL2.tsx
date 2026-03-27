import { Question, Answer } from '../../types'
import { useApp } from '../../hooks/useAppStore'
import { pct } from '../../utils/helpers'
import DiffTag from '../../components/DiffTag'
import { useQuestionLogic } from './QuestionL1'

interface Props {
  question: Question
  index: number
  questions: Question[]
  onAnswer: (a: Answer) => void
  onNext: () => void
  isLast: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']
const MAX = 7

export default function QuestionL2({ question, index, questions, onAnswer, onNext, isLast }: Props) {
  const { state } = useApp()
  const { selected, answered, choose } = useQuestionLogic(question, onAnswer)
  const isCorrect = selected !== null && selected === question.correct
  const p = pct(state.score, MAX)

  return (
    <div className="w-full max-w-[860px] animate-fade-up grid grid-cols-[200px_1fr] gap-5 items-start">
      {/* Sidebar */}
      <div className="bg-navy rounded-[14px] p-5 sticky top-20">
        <h4 className="font-display text-[.85rem] text-sky mb-4 uppercase tracking-wide">Progresso</h4>
        <div className="flex flex-col gap-2">
          {questions.map((q, j) => (
            <div key={q.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.78rem] transition-all
              ${j < index ? 'text-sky bg-sky/10' : j === index ? 'text-white bg-blue' : 'text-white/40'}`}>
              <div className={`w-2 h-2 rounded-full flex-shrink-0
                ${j < index ? 'bg-sky' : j === index ? 'bg-white' : 'bg-white/20'}`} />
              <span>{j < index ? `✓ Q${j + 1}` : `Q${j + 1} — ${q.difficulty.slice(0, 5)}.`}</span>
            </div>
          ))}
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[.78rem] text-white/40`}>
            <div className="w-2 h-2 rounded-full flex-shrink-0 bg-white/20" />
            <span>Código</span>
          </div>
        </div>
        <div className="mt-5 bg-white/7 rounded-xl p-3.5 text-center">
          <div className="font-mono text-[1.6rem] font-bold text-white">
            {state.score}<span className="text-[.9rem] opacity-50">/5</span>
          </div>
          <div className="text-[.7rem] text-sky uppercase tracking-wide mt-0.5">Pontos</div>
          <div className="text-[.8rem] text-white/50 mt-1">{p}% de aproveitamento</div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-surface rounded-[14px] border border-border shadow-card-lg p-8">
        <div className="flex items-center gap-2 text-[.72rem] font-semibold text-muted uppercase tracking-[.8px] mb-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue" />
          {question.category.toUpperCase()}
        </div>
        <DiffTag d={question.difficulty} />
        <p
          className="text-[1.05rem] font-semibold text-navy leading-[1.55] mt-3 mb-6"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />

        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i
            const isReveal   = !isCorrect && answered && i === question.correct
            let cls = 'flex items-center gap-2.5 p-3 border-[1.5px] border-border rounded-[10px] bg-[#FAFCFF] text-[.88rem] text-text transition-all duration-150 text-left cursor-pointer w-full'
            if (!answered) cls += ' hover:border-blue hover:bg-[#EAF2FB] hover:translate-x-1'
            if (answered)  cls += ' cursor-not-allowed'
            if (isSelected && isCorrect)  cls += ' !border-green !bg-green-bg !text-green font-semibold'
            if (isSelected && !isCorrect) cls += ' !border-red !bg-red-bg !text-red font-semibold animate-shake'
            if (isReveal) cls += ' !border-green !bg-green-bg !opacity-100'

            const ltrBase = 'w-[26px] h-[26px] rounded-md flex items-center justify-center text-[.72rem] font-bold flex-shrink-0 font-mono'
            let ltrCls = `${ltrBase} bg-border text-muted`
            if (isSelected && isCorrect)  ltrCls = `${ltrBase} bg-green text-white`
            if (isSelected && !isCorrect) ltrCls = `${ltrBase} bg-red text-white`
            if (isReveal)                 ltrCls = `${ltrBase} bg-green text-white`

            return (
              <button key={i} disabled={answered} onClick={() => choose(i)} className={cls}>
                <span className={ltrCls}>{isSelected ? (isCorrect ? '✓' : '✗') : isReveal ? '✓' : LETTERS[i]}</span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`mt-4 p-3.5 rounded-[10px] text-[.85rem] leading-[1.55] flex gap-3 animate-reveal border
            ${isCorrect ? 'bg-green-bg border-[#A8D9BE] text-[#1a4d30]' : 'bg-red-bg border-[#F0AAAA] text-[#7a1818]'}`}>
            <span className="text-base flex-shrink-0 mt-0.5">{isCorrect ? '✅' : '❌'}</span>
            <div dangerouslySetInnerHTML={{ __html: isCorrect ? question.feedbackOk : question.feedbackNok }} />
          </div>
        )}
        {answered && (
          <div className="flex justify-end mt-5">
            <button onClick={onNext} className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-[.88rem] hover:bg-navy active:scale-[.97] transition-all">
              {isLast ? 'Ir para o Código →' : 'Próxima →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
