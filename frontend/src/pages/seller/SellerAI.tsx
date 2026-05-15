import { useState, useRef, useEffect } from 'react'
import { Bot, Sparkles, TrendingUp, FileText, Send, Copy, Check, MessageSquare } from 'lucide-react'
import { aiApi } from '../../api/ai'

type Tab = 'description' | 'chat'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

const TIPS = [
  {
    icon: TrendingUp,
    title: 'Повышение продаж',
    text: 'Добавьте качественные фото товаров — конверсия растёт на 30%. Используйте фото на белом фоне с несколькими ракурсами.',
  },
  {
    icon: FileText,
    title: 'Описание товара',
    text: 'Включайте ключевые характеристики в первых двух предложениях. Покупатели принимают решение за 3 секунды.',
  },
  {
    icon: Sparkles,
    title: 'Акции и скидки',
    text: 'Скидки 10–20% увеличивают количество заказов в среднем на 25%. Попробуйте ограниченную по времени акцию.',
  },
]

const QUICK_PROMPTS = [
  'Как увеличить продажи в праздники?',
  'Советы по ценообразованию товаров',
  'Как работать с негативными отзывами?',
  'Как улучшить фотографии товаров?',
]

export default function SellerAI() {
  const [tab, setTab] = useState<Tab>('description')

  const [productName, setProductName] = useState('')
  const [category, setCategory]       = useState('')
  const [details, setDetails]         = useState('')
  const [description, setDescription] = useState('')
  const [descLoading, setDescLoading] = useState(false)
  const [descError, setDescError]     = useState('')
  const [copied, setCopied]           = useState(false)

  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  const generateDescription = async () => {
    if (!productName.trim()) return
    setDescLoading(true)
    setDescription('')
    setDescError('')
    try {
      const result = await aiApi.generateDescription(
        productName.trim(),
        category.trim() || undefined,
        details.trim() || undefined,
      )
      setDescription(result)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? ''
      setDescError(
        detail === 'ANTHROPIC_API_KEY не настроен'
          ? 'AI ключ не настроен. Добавьте ANTHROPIC_API_KEY в backend/.env'
          : 'Ошибка генерации. Попробуйте ещё раз.',
      )
    } finally {
      setDescLoading(false)
    }
  }

  const copyDescription = () => {
    navigator.clipboard.writeText(description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendChat = async (text?: string) => {
    const msg = (text ?? chatInput).trim()
    if (!msg || chatLoading) return
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setChatLoading(true)
    try {
      const result = await aiApi.chat(msg)
      setMessages(prev => [...prev, { role: 'assistant', text: result }])
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: 'Ошибка. Проверьте настройки ANTHROPIC_API_KEY в .env.' },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Ассистент</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Генерация описаний и советы по продажам на базе Claude AI
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
        {(
          [
            ['description', Bot, 'Описание товара'],
            ['chat', MessageSquare, 'AI Чат'],
          ] as const
        ).map(([t, Icon, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'description' ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-[#004B57] rounded-lg flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Генератор описания</h2>
              <p className="text-xs text-gray-400">Заполните поля — AI напишет продающий текст</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название товара <span className="text-red-400">*</span>
              </label>
              <input
                value={productName}
                onChange={e => setProductName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && generateDescription()}
                placeholder="Например: Беспроводные наушники Sony WH-1000XM5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <input
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="Электроника, одежда..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Характеристики</label>
                <input
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Цвет, размер, материал..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
                />
              </div>
            </div>

            <button
              onClick={generateDescription}
              disabled={descLoading || !productName.trim()}
              className="flex items-center gap-2 bg-[#004B57] hover:bg-[#003840] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Sparkles size={15} />
              {descLoading ? 'Генерация...' : 'Сгенерировать описание'}
            </button>
          </div>

          {descError && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-100 text-sm text-red-600">
              {descError}
            </div>
          )}

          {description && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Результат</p>
                <button
                  onClick={copyDescription}
                  className="flex items-center gap-1.5 text-xs text-[#004B57] hover:text-[#003840] font-medium transition-colors"
                >
                  {copied ? (
                    <><Check size={12} /> Скопировано</>
                  ) : (
                    <><Copy size={12} /> Скопировать</>
                  )}
                </button>
              </div>
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                {description}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div
          className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col"
          style={{ height: 480 }}
        >
          <div className="flex items-center gap-2 p-4 border-b border-gray-50">
            <div className="w-7 h-7 bg-[#004B57] rounded-lg flex items-center justify-center">
              <MessageSquare size={14} className="text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">AI Чат</h2>
              <p className="text-xs text-gray-400">Задайте любой вопрос о продажах</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-[#004B57]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Bot size={22} className="text-[#004B57]" />
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Задайте вопрос о продажах или выберите готовый:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => sendChat(p)}
                      className="text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-2 rounded-lg border border-gray-200 transition-colors text-left"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 bg-[#004B57] rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <Bot size={12} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-[#004B57] text-white rounded-br-sm'
                      : 'bg-gray-50 text-gray-800 rounded-bl-sm border border-gray-100'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-[#004B57] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          <div className="p-3 border-t border-gray-50">
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
                placeholder="Задайте вопрос..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
              />
              <button
                onClick={() => sendChat()}
                disabled={!chatInput.trim() || chatLoading}
                className="w-9 h-9 bg-[#004B57] hover:bg-[#003840] text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

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
