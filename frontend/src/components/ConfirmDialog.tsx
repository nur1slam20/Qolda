import { create } from 'zustand'
import { AlertTriangle } from 'lucide-react'

interface ConfirmState {
  open:    boolean
  message: string
  resolve: ((v: boolean) => void) | null
  show:    (message: string) => Promise<boolean>
  answer:  (v: boolean) => void
}

export const useConfirmStore = create<ConfirmState>(set => ({
  open:    false,
  message: '',
  resolve: null,
  show: message => new Promise(resolve => {
    set({ open: true, message, resolve })
  }),
  answer: v => set(s => {
    s.resolve?.(v)
    return { open: false, resolve: null }
  }),
}))

export function confirm(message: string): Promise<boolean> {
  return useConfirmStore.getState().show(message)
}

export default function ConfirmDialog() {
  const { open, message, answer } = useConfirmStore()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => answer(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex gap-4 items-start mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={18} className="text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">Подтверждение</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => answer(false)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={() => answer(true)}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  )
}
