interface ModalProps {
  title: string
  sub: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ title, sub, onConfirm, onCancel }: ModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/45 z-[500] flex items-center justify-center p-4 animate-fade-up"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="bg-surface rounded-card shadow-[0_24px_80px_rgba(0,0,0,.25)] p-8 max-w-[480px] w-full animate-scale-in">
        <h3 className="font-display text-[1.1rem] font-extrabold text-navy mb-1">{title}</h3>
        <p className="text-[.84rem] text-muted mb-6">{sub}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border border-border text-muted text-[.85rem] font-semibold hover:border-blue hover:text-blue transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-xl bg-red text-white text-[.85rem] font-semibold hover:bg-[#8a2020] transition-all"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}
