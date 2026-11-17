import { useApp } from '../../hooks/useAppStore'
import QuestionL1 from './QuestionL1'
import QuestionL2 from './QuestionL2'
import QuestionL3 from './QuestionL3'
import CodeChallengeScreen from './CodeChallengeScreen'
import { Answer } from '../../types'

interface Props { onToast: (msg: string) => void }

export default function ChallengeScreen({ onToast }: Props) {
  const { state, db, setState, addAnswer, addScore } = useApp()
  const questions = db.questions

  if (state.currentQ >= 5) return <CodeChallengeScreen onToast={onToast} />

  const q = questions[state.currentQ]
  const isLast = state.currentQ === 4

  const handleAnswer = (a: Answer) => {
    addAnswer(a)
    if (a.correct) addScore(1)
  }

  const handleNext = () => setState({ currentQ: state.currentQ + 1 })

  const sharedProps = {
    question: q,
    index: state.currentQ,
    onAnswer: handleAnswer,
    onNext: handleNext,
    isLast,
  }

  if (state.layout === 3) return <QuestionL3 {...sharedProps} />
  if (state.layout === 2) return <QuestionL2 {...sharedProps} questions={questions} />
  return <QuestionL1 {...sharedProps} totalQ={5} />
}
