import { useEffect, useRef, useState } from 'react'
import { Send, MessageCircle, Search, ChevronLeft, Circle } from 'lucide-react'
import { messagesApi, type MessageOut, type SellerContact } from '../api/messages'
import { useUserStore } from '../store/userStore'

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'сейчас'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин`
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-[#004B57]', 'bg-purple-600', 'bg-blue-600', 'bg-emerald-600', 'bg-rose-600']
  const color = colors[name.charCodeAt(0) % colors.length]
  const sz = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-10 h-10 text-sm'
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function Chat() {
  const user = useUserStore(s => s.user)
  const [sellers, setSellers] = useState<SellerContact[]>([])
  const [selected, setSelected] = useState<SellerContact | null>(null)
  const [messages, setMessages] = useState<MessageOut[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingSellers, setLoadingSellers] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [search, setSearch] = useState('')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    messagesApi.getSellers()
      .then(setSellers)
      .finally(() => setLoadingSellers(false))
  }, [])

  useEffect(() => {
    if (!selected) return
    setLoadingMsgs(true)
    messagesApi.getConversation(selected.id)
      .then(setMessages)
      .finally(() => setLoadingMsgs(false))

    // Poll for new messages every 5s
    pollRef.current = setInterval(() => {
      messagesApi.getConversation(selected.id).then(setMessages)
    }, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectSeller = (seller: SellerContact) => {
    setSelected(seller)
    setMobileView('chat')
    setSellers(prev => prev.map(s => s.id === seller.id ? { ...s, unread_count: 0 } : s))
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const send = async () => {
    if (!text.trim() || !selected || sending) return
    const t = text.trim()
    setText('')
    setSending(true)
    try {
      const msg = await messagesApi.send(selected.id, t)
      setMessages(prev => [...prev, msg])
    } catch {
      setText(t)
    } finally {
      setSending(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const filtered = sellers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = sellers.reduce((acc, s) => acc + s.unread_count, 0)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageCircle className="text-[#004B57]" size={26} />
            Чат с продавцами
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Сатушылармен чат</p>
        </div>
        {totalUnread > 0 && (
          <span className="bg-[#004B57] text-white text-sm font-bold px-3 py-1 rounded-full">
            {totalUnread} непрочитанных
          </span>
        )}
      </div>

      {/* Chat container */}
      <div className="card overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: 500 }}>
        <div className="flex h-full">

          {/* Sidebar — sellers list */}
          <div className={`w-full md:w-72 lg:w-80 border-r dark:border-gray-800 flex flex-col flex-shrink-0 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b dark:border-gray-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none dark:text-white"
                  placeholder="Поиск продавца..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Sellers */}
            <div className="flex-1 overflow-y-auto">
              {loadingSellers ? (
                <div className="p-4 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-3/4" />
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 animate-pulse rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {search ? 'Продавец не найден' : 'Нет доступных продавцов'}
                  </p>
                </div>
              ) : (
                filtered.map(seller => (
                  <button
                    key={seller.id}
                    onClick={() => selectSeller(seller)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left ${
                      selected?.id === seller.id ? 'bg-[#004B57]/5 dark:bg-[#004B57]/10 border-r-2 border-[#004B57]' : ''
                    }`}
                  >
                    <div className="relative">
                      <Avatar name={seller.name} />
                      <Circle size={10} className="absolute bottom-0 right-0 fill-green-400 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{seller.name}</p>
                        {seller.unread_count > 0 && (
                          <span className="bg-[#004B57] text-white text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-2">
                            {seller.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{seller.email}</p>
                      <p className="text-xs text-emerald-500 font-medium">● онлайн</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {selected ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-gray-800 bg-white dark:bg-gray-900">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <Avatar name={selected.name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{selected.name}</p>
                    <p className="text-xs text-emerald-500 font-medium">● онлайн · продавец</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
                  {loadingMsgs ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                          <div className={`h-10 rounded-2xl animate-pulse bg-gray-200 dark:bg-gray-800 ${i % 2 === 0 ? 'w-40' : 'w-56'}`} />
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-[#004B57]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={28} className="text-[#004B57]" />
                      </div>
                      <p className="font-medium text-gray-600 dark:text-gray-400">Начните разговор</p>
                      <p className="text-sm text-gray-400 mt-1">Напишите {selected.name} по любому вопросу</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMe = msg.sender_id === user?.id
                      const showTime = i === 0 || (new Date(msg.created_at).getTime() - new Date(messages[i-1].created_at).getTime()) > 5 * 60_000
                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <div className="text-center text-xs text-gray-400 my-2">{formatTime(msg.created_at)}</div>
                          )}
                          <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && <Avatar name={selected.name} size="sm" />}
                            <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isMe
                                ? 'bg-[#004B57] text-white rounded-br-md'
                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-md'
                            }`}>
                              {msg.text}
                              <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'} text-right`}>
                                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                {isMe && <span className="ml-1">{msg.is_read ? '✓✓' : '✓'}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="p-3 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-2">
                    <input
                      ref={inputRef}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30 dark:text-white dark:placeholder-gray-500 transition-all"
                      placeholder="Написать сообщение..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      onKeyDown={handleKey}
                    />
                    <button
                      onClick={send}
                      disabled={!text.trim() || sending}
                      className="w-10 h-10 bg-[#004B57] hover:bg-[#003840] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 pl-1">Enter — отправить</p>
                </div>
              </>
            ) : (
              /* No seller selected */
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
                <div className="w-20 h-20 bg-[#004B57]/10 rounded-2xl flex items-center justify-center mb-5">
                  <MessageCircle size={36} className="text-[#004B57]" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Выберите продавца
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  Слева выберите продавца, чтобы начать переписку. Вы можете задать вопрос о товаре или заказе.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
