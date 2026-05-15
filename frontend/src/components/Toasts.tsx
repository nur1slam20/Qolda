import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../store/toastStore'
import type { ToastType } from '../store/toastStore'

const CFG: Record<ToastType, { icon: typeof CheckCircle; cls: string; bar: string }> = {
  success: { icon: CheckCircle, cls: 'bg-white border-green-200 text-green-800',  bar: 'bg-green-500'  },
  error:   { icon: XCircle,     cls: 'bg-white border-red-200 text-red-800',      bar: 'bg-red-500'    },
  info:    { icon: Info,        cls: 'bg-white border-blue-200 text-[#004B57]',   bar: 'bg-[#004B57]'  },
}

export default function Toasts() {
  const { toasts, remove } = useToastStore()

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const { icon: Icon, cls, bar } = CFG[t.type]
        return (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg pointer-events-auto animate-in slide-in-from-right-5 fade-in ${cls}`}
          >
            <Icon size={18} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="flex-shrink-0 opacity-40 hover:opacity-70 transition-opacity"
            >
              <X size={14} />
            </button>
            <div className={`absolute bottom-0 left-0 h-0.5 rounded-full ${bar} animate-shrink`} />
          </div>
        )
      })}
    </div>
  )
}
