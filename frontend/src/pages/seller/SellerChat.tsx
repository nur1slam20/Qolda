import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, Search } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { messagesApi, type MessageOut, type SellerContact } from '../../api/messages'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  return isToday
    ? d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

export default function SellerChat() {
  const user = useUserStore(s => s.user)

  const [sellers, setSellers]         = useState<SellerContact[]>([])
  const [selected, setSelected]       = useState<SellerContact | null>(null)
  const [messages, setMessages]       = useState<MessageOut[]>([])
  const [input, setInput]             = useState('')
  const [sending, setSending]         = useState(false)
  const [search, setSearch]           = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesApi.getSellers().then(setSellers)
  }, [])

  useEffect(() => {
    if (!selected) return
    messagesApi.getConversation(selected.id).then(msgs => {
      setMessages(msgs)
      setSellers(prev =>
        prev.map(s => s.id === selected.id ? { ...s, unread_count: 0 } : s)
      )
    })
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !selected || sending) return
    setSending(true)
    try {
      const msg = await messagesApi.send(selected.id, input.trim())
      setMessages(prev => [...prev, msg])
      setInput('')
    } finally {
      setSending(false)
    }
  }

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = sellers.reduce((sum, s) => sum + s.unread_count, 0)

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Чат продавцов</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Общение с другими продавцами платформы
          {totalUnread > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{totalUnread}</span>
          )}
        </p>
      </div>

      <div className="flex flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 0 }}>

        {/* Contacts */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск продавца..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#004B57]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm px-4">
                <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                {sellers.length === 0 ? 'Других продавцов пока нет' : 'Не найдено'}
              </div>
            ) : (
              filtered.map(s => {
                const isActive = selected?.id === s.id
                const initials = s.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${isActive ? 'bg-[#004B57]/5' : ''}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#004B57] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-[#004B57]' : 'text-gray-900'}`}>{s.name}</p>
                      <p className="text-xs text-gray-400 truncate">{s.email}</p>
                    </div>
                    {s.unread_count > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {s.unread_count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center text-gray-400 p-8">
              <div>
                <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">Выберите продавца из списка слева</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#004B57] flex items-center justify-center text-white text-xs font-bold">
                  {selected.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-400">Продавец · {selected.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    Начните диалог с {selected.name}
                  </div>
                )}
                {messages.map(m => {
                  const isOwn = m.sender_id === user?.id
                  return (
                    <div key={m.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] group`}>
                        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-[#004B57] text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          {m.text}
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right' : ''}`}>
                          {formatTime(m.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={`Написать ${selected.name}...`}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 bg-[#004B57] hover:bg-[#003840] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 flex-shrink-0"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
