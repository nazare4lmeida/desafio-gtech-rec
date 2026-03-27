import { useApp } from '../hooks/useAppStore'
import { initials } from '../utils/helpers'

export default function Header() {
  const { state, logout } = useApp()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-[58px] px-7 bg-navy shadow-[0_2px_16px_rgba(0,0,0,.22)]">
      <div className="flex items-center gap-2.5 font-mono font-bold text-[1.05rem] text-white tracking-tight select-none">
        <div className="w-[30px] h-[30px] bg-blue rounded-lg flex items-center justify-center text-[.95rem]">⌨️</div>
        Desafio<span className="text-sky">Gtech</span>Recupera
      </div>

      {state.user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3.5 py-1 text-[.8rem] text-sky">
            <div className="w-6 h-6 bg-blue rounded-full flex items-center justify-center text-[.65rem] font-bold text-white">
              {initials(state.user.name)}
            </div>
            {state.user.name.split(' ')[0]}
          </div>
          <button
            onClick={logout}
            className="bg-transparent border border-white/20 text-white/60 px-3 py-1 rounded-md text-[.75rem] hover:bg-white/10 hover:text-white transition-all"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  )
}
