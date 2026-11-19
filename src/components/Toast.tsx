import { useEffect, useState } from 'react'

type ToastItem = { id: string; message: string }

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (e: Event): void => {
      const detail = (e as CustomEvent).detail as { message: string }
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev.slice(-2), { id, message: detail.message }]) // max 3
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
    }
    window.addEventListener('azt:toast' as unknown as string, handler as EventListener)
    return () => window.removeEventListener('azt:toast' as unknown as string, handler as EventListener)
  }, [])

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          {t.message}
        </div>
      ))}
    </div>
  )
}

export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent('azt:toast', { detail: { message } }))
}
