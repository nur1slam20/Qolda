import { useState } from 'react'
import { Bot, Sparkles, TrendingUp, FileText } from 'lucide-react'

const TIPS = [
  { icon: TrendingUp, title: 'Повышение продаж', text: 'Добавьте качественные фото товаров — конверсия растёт на 30%. Используйте фото на белом фоне с несколькими ракурсами.' },
  { icon: FileText, title: 'Описание товара', text: 'Включайте ключевые характеристики в первых двух предложениях. Покупатели принимают решение за 3 секунды.' },
  { icon: Sparkles, title: 'Акции и скидки', text: 'Скидки 10-20% увеличивают количество заказов в среднем на 25%. Попробуйте ограниченную по времени акцию.' },
]

export default function SellerAI() {
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = () => {
    if (!prompt.trim()) return
    setLoading(true)
    setResult('')
    setTimeout(() => {
      setResult(
        `Профессиональное описание для «${prompt.trim()}»:\n\n` +
        `Представляем вашему вниманию ${prompt.trim()} — идеальное решение для тех, кто ценит качество и функциональность. ` +
        `Изготовлено из высококачественных материалов, обеспечивающих долговечность и надёжность в использовании. ` +
        `Эргономичный дизайн гарантирует комфорт при ежедневном применении.\n\n` +
        `✓ Высокое качество материалов\n` +
        `✓ Современный дизайн\n` +
        `✓ Гарантия производителя\n` +
        `✓ Быстрая доставка`
      )
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Ассистент</h1>
        <p className="text-sm text-gray-400 mt-0.5">Генерация описаний товаров и советы по продажам</p>
      </div>

      {/* Generator */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-[#004B57] rounded-lg flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <h2 className="font-semibold text-gray-900">Генератор описания товара</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название товара
            </label>
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              placeholder="Например: Беспроводные наушники Sony WH-1000XM5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
            />
          </div>
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <Sparkles size={15} />
            {loading ? 'Генерация...' : 'Сгенерировать описание'}
          </button>
        </div>

        {result && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-2 uppercase tracking-wide">Результат</p>
            <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{result}</pre>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="mt-3 text-xs text-[#004B57] hover:underline font-medium"
            >
              Скопировать →
            </button>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TIPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="w-8 h-8 bg-[#004B57]/10 rounded-lg flex items-center justify-center mb-3">
              <Icon size={15} className="text-[#004B57]" />
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
