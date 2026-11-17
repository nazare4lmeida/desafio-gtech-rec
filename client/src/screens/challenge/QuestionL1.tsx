import { useState } from 'react'
import { Question, Answer } from '../../types'
import DiffTag from '../../components/DiffTag'

interface QuestionCardProps {
  question: Question
  index: number
  totalQ: number
  onAnswer: (a: Answer) => void
  onNext: () => void
  isLast: boolean
}

const LETTERS = ['A', 'B', 'C', 'D']

export function useQuestionLogic(question: Question, onAnswer: (a: Answer) => void) {
  const [selected, setSelected]     = useState<number | null>(null)
  const [answered, setAnswered]     = useState(false)

  const choose = (idx: number) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const correct = idx === question.correct
    onAnswer({ qid: question.id, sel: idx, correct, category: question.category })
  }

  return { selected, answered, choose }
}

export default function QuestionL1({ question, index, totalQ, onAnswer, onNext, isLast }: QuestionCardProps) {
  const { selected, answered, choose } = useQuestionLogic(question, onAnswer)
  const isCorrect = selected !== null && selected === question.correct

  return (
    <div className="w-full max-w-[580px] animate-fade-up">
      <div className="bg-surface rounded-card border border-border shadow-card-lg p-10">
        <p className="font-mono text-[.68rem] tracking-[1.5px] uppercase text-blue mb-2">
          Questão {index + 1} de {totalQ}
        </p>
        <DiffTag d={question.difficulty} />
        <p
          className="text-[1.05rem] font-semibold text-navy leading-[1.55] mt-3 mb-6"
          dangerouslySetInnerHTML={{ __html: question.text }}
        />

        <div className="flex flex-col gap-2.5">
          {question.options.map((opt, i) => {
            const isSelected = selected === i
            const isReveal   = !isCorrect && answered && i === question.correct
            let cls = 'flex items-center gap-2.5 p-3 border-[1.5px] border-border rounded-[10px] bg-[#FAFCFF] text-[.88rem] text-text transition-all duration-150 text-left cursor-pointer'
            if (!answered) cls += ' hover:border-blue hover:bg-[#EAF2FB] hover:translate-x-1'
            if (answered) cls += ' cursor-not-allowed'
            if (isSelected && isCorrect)  cls = cls.replace('border-border bg-[#FAFCFF]', 'border-green bg-green-bg text-green font-semibold') + ' animate-reveal'
            if (isSelected && !isCorrect) cls = cls.replace('border-border bg-[#FAFCFF]', 'border-red bg-red-bg text-red font-semibold') + ' animate-shake'
            if (isReveal) cls = cls.replace('border-border bg-[#FAFCFF]', 'border-green bg-green-bg !opacity-100')

            const ltrBase = 'w-[26px] h-[26px] rounded-md flex items-center justify-center text-[.72rem] font-bold flex-shrink-0 font-mono'
            let ltrCls = `${ltrBase} bg-border text-muted`
            if (isSelected && isCorrect)  ltrCls = `${ltrBase} bg-green text-white`
            if (isSelected && !isCorrect) ltrCls = `${ltrBase} bg-red text-white`
            if (isReveal)                 ltrCls = `${ltrBase} bg-green text-white`

            return (
              <button key={i} disabled={answered} onClick={() => choose(i)} className={cls}>
                <span className={ltrCls}>
                  {isSelected ? (isCorrect ? '✓' : '✗') : isReveal ? '✓' : LETTERS[i]}
                </span>
                <span dangerouslySetInnerHTML={{ __html: opt }} />
              </button>
            )
          })}
        </div>

        {answered && (
          <div className={`mt-4 p-3.5 rounded-[10px] text-[.85rem] leading-[1.55] flex gap-3 animate-reveal border
            ${isCorrect
              ? 'bg-green-bg border-[#A8D9BE] text-[#1a4d30]'
              : 'bg-red-bg border-[#F0AAAA] text-[#7a1818]'}`}>
            <span className="text-base flex-shrink-0 mt-0.5">{isCorrect ? '✅' : '❌'}</span>
            <div dangerouslySetInnerHTML={{ __html: isCorrect ? question.feedbackOk : question.feedbackNok }} />
          </div>
        )}

        {answered && (
          <div className="flex justify-end mt-5">
            <button
              onClick={onNext}
              className="px-6 py-2.5 bg-blue text-white font-semibold rounded-xl text-[.88rem] hover:bg-navy active:scale-[.97] transition-all"
            >
              {isLast ? 'Ir para o Código →' : 'Próxima →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
