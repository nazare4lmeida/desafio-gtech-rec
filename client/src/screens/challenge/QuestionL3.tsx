import { Question, Answer } from '../../types'
import { useQuestionLogic } from './QuestionL1'

interface Props {
  question: Question
  index: number
  onAnswer: (a: Answer) => void
  onNext: () => void
  isLast: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuestionL3({ question, index, onAnswer, onNext, isLast }: Props) {
  const { selected, answered, choose } = useQuestionLogic(question, onAnswer)
  const isCorrect = selected !== null && selected === question.correct

  return (
    <div className="w-full max-w-[640px] animate-fade-up">
      <div
        className="rounded-card overflow-hidden"
        style={{ background: '#1E3A5F', boxShadow: '0 0 0 1px rgba(168,197,224,.2), 0 20px 60px rgba(30,58,95,.35)' }}
      >
        {/* Topbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-sky/10" style={{ background: '#162d4a' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="font-mono text-[.7rem] text-sky/50 ml-2">
            devdeskgame — questão {index + 1}/5
          </span>
        </div>

        {/* Body */}
        <div className="p-7">
          <p className="font-mono text-[.68rem] text-sky mb-1">
            $ question {index + 1} | {question.category} | {question.difficulty}
          </p>
          <p className={`inline-block px-2.5 py-0.5 rounded-full text-[.68rem] font-bold tracking-wide uppercase mb-4
            ${question.difficulty === 'beginner' || question.difficulty === 'beginner+'
              ? 'bg-green-bg text-green'
              : question.difficulty === 'intermediate'
              ? 'bg-gold-bg text-gold'
              : 'bg-red-bg text-red'}`}>
            {question.difficulty === 'beginner' ? 'Principiante' : question.difficulty === 'intermediate' ? 'Intermediário' : 'Difícil'}
          </p>

          <p
            className="text-white font-medium text-[1rem] leading-[1.6] border-l-2 border-blue pl-3.5 mb-6"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />

          <div className="grid grid-cols-2 gap-2.5">
            {question.options.map((opt, i) => {
              const isSelected = selected === i
              const isReveal   = !isCorrect && answered && i === question.correct
              let cls = 'flex gap-2.5 items-start p-3.5 rounded-[10px] text-left text-[.82rem] transition-all duration-150 border cursor-pointer'
              cls += ' bg-white/5 border-sky/15 text-white/75'
              if (!answered) cls += ' hover:bg-blue/30 hover:border-blue hover:text-white'
              if (answered)  cls += ' cursor-not-allowed'
              if (isSelected && isCorrect)  cls += ' !bg-green/30 !border-green !text-[#7ae8a8] font-semibold'
              if (isSelected && !isCorrect) cls += ' !bg-red/25 !border-red !text-[#f09090] animate-shake'
              if (isReveal)                 cls += ' !bg-green/20 !border-green !opacity-100'

              const ltrBase = 'font-mono text-[.65rem] font-bold w-5 h-5 rounded flex items-center justify-center flex-shrink-0'
              let ltrCls = `${ltrBase} bg-white/10 text-sky`
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
            <div className={`mt-4 p-3.5 rounded-[10px] text-[.83rem] leading-[1.5] flex gap-3 animate-reveal border
              ${isCorrect
                ? 'bg-green/20 border-green/40 text-[#7ae8a8]'
                : 'bg-red/20 border-red/40 text-[#f09090]'}`}>
              <span>{isCorrect ? '✅' : '❌'}</span>
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
    </div>
  )
}
