import { useState, useCallback } from 'react'

interface Toast {
  id: number
  msg: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((msg: string, dur = 2600) => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur)
  }, [])

  return { toasts, toast }
}
