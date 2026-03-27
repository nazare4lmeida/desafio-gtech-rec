import { AppProvider, useApp } from './hooks/useAppStore'
import { useToast } from './hooks/useToast'
import Header          from './components/Header'
import ProgressStrip   from './components/ProgressStrip'
import ToastContainer  from './components/Toast'
import LoginScreen     from './screens/LoginScreen'
import SelectScreen    from './screens/SelectScreen'
import ChallengeScreen from './screens/challenge/index'
import ResultScreen    from './screens/ResultScreen'
import AdminScreen     from './screens/admin/index'
import ProvaRecuperacao from './screens/recuperacao/ProvaRecuperacao'
import DesafioPresenca  from './screens/presenca/DesafioPresenca'
import StudyGuideScreen from './screens/study/StudyGuideScreen'

function Inner() {
  const { state } = useApp()
  const { toasts, toast } = useToast()

  const isAdmin    = state.screen === 'admin'
  const isFullPage = isAdmin

  return (
    <div className="min-h-screen flex flex-col bg-[#EFF4FA]">
      <Header />
      <ProgressStrip />

      <main className={`flex-1 ${isFullPage ? 'flex' : 'flex items-start justify-center px-4 py-8'}`}>
        {state.screen === 'login'       && <LoginScreen />}
        {state.screen === 'select'      && <SelectScreen />}
        {state.screen === 'challenge'   && <ChallengeScreen onToast={toast} />}
        {state.screen === 'result'      && <ResultScreen onToast={toast} />}
        {state.screen === 'admin'       && <AdminScreen onToast={toast} />}
        {state.screen === 'recuperacao' && <ProvaRecuperacao />}
        {state.screen === 'presenca'    && <DesafioPresenca />}
        {state.screen === "roteiro" && <StudyGuideScreen />}
      </main>

      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Inner />
    </AppProvider>
  )
}
