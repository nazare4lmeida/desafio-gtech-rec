interface ToastItem { id: number; msg: string }

export default function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="bg-navy text-white px-5 py-2.5 rounded-full text-[.82rem] font-medium shadow-card-lg animate-fade-up whitespace-nowrap"
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
