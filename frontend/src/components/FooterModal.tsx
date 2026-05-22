import { useEffect } from 'react'
import { X } from 'lucide-react'

interface FooterModalProps {
  title: string
  content: React.ReactNode
  onClose: () => void
}

export default function FooterModal({ title, content, onClose }: FooterModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-[#1e1e1e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-2xl animate-[slideUp_0.25s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 text-gray-300 text-sm leading-relaxed space-y-3">
          {content}
        </div>
      </div>
    </div>
  )
}
