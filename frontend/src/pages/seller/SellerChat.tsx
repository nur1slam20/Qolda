import { useEffect, useRef, useState } from 'react'
import { Send, MessageSquare, Search, Circle, Users } from 'lucide-react'
import { useUserStore } from '../../store/userStore'
import { messagesApi, type MessageOut, type ContactOut } from '../../api/messages'

function fmtTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60_000) return 'сейчас'
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  if (diff < 7 * 86_400_000)
    return d.toLocaleDateString('ru-RU', { weekday: 'short' })
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

function Avatar({ name, size = 10 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['bg-teal-600', 'bg-blue-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-600']
  const color  = colors[name.charCodeAt(0) % colors.length]
  const sz = `w-${size} h-${size}`
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-xs`}>
      {initials}
    </div>
  )
}

export default function SellerChat() {
  const user = useUserStore(s => s.user)

  const [clients, setClients]   = useState<ContactOut[]>([])
  const [selected, setSelected] = useState<ContactOut | null>(null)
  const [messages, setMessages] = useState<MessageOut[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const bottomRef  = useRef<HTMLDivElement>(null)
  const inputRef   = useRef<HTMLInputElement>(null)
  const pollRef    = useRef<ReturnType<typeof setInterval> | null>(null)

  // Загрузка клиентов + поллинг
  const loadClients = () =>
    messagesApi.getClients().then(list => {
      setClients(list)
      setLoading(false)
    })

  useEffect(() => {
    loadClients()
    const id = setInterval(loadClients, 8000)
    return () => clearInterval(id)
  }, [])

  // Загрузка сообщений при выборе клиента + поллинг
  useEffect(() => {
    if (!selected) return
    const load = () =>
      messagesApi.getConversation(selected.id).then(msgs => {
        setMessages(msgs)
        // Сбрасываем счётчик непрочитанных
        setClients(prev => prev.map(c => c.id === selected.id ? { ...c, unread_count: 0 } : c))
      })
    load()
    pollRef.current = setInterval(load, 4000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectClient = (c: ContactOut) => {
    setSelected(c)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const send = async () => {
    if (!input.trim() || !selected || sending) return
    const t = input.trim()
    setInput('')
    setSending(true)
    try {
      const msg = await messagesApi.send(selected.id, t)
      setMessages(prev => [...prev, msg])
      // Обновляем последнее сообщение в списке
      setClients(prev => prev.map(c =>
        c.id === selected.id
          ? { ...c, last_message: t, last_message_at: new Date().toISOString() }
          : c
      ))
    } catch {
      setInput(t)
    } finally {
      setSending(false)
    }
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const totalUnread = clients.reduce((s, c) => s + c.unread_count, 0)

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Page header */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={22} className="text-[#004B57]" /> Чат с клиентами
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Переписка с покупателями
            {totalUnread > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                {totalUnread} новых
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ minHeight: 0 }}>

        {/* ── Список клиентов ── */}
        <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-gray-50">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Поиск клиента..."
                className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-[#004B57]/20"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
                      <div className="h-2 bg-gray-200 animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center px-4">
                <MessageSquare size={36} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400 font-medium">
                  {clients.length === 0 ? 'Клиентов пока нет' : 'Не найдено'}
                </p>
                {clients.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Клиенты появятся здесь после первого сообщения
                  </p>
                )}
              </div>
            ) : (
              filtered.map(c => {
                const active = selected?.id === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => selectClient(c)}
                    className={`w-full flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${
                      active ? 'bg-[#004B57]/5 border-l-2 border-l-[#004B57]' : ''
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar name={c.name} size={10} />
                      <Circle size={8} className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-sm font-semibold truncate ${active ? 'text-[#004B57]' : 'text-gray-900'}`}>
                          {c.name}
                        </p>
                        {c.last_message_at && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{fmtTime(c.last_message_at)}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {c.last_message ?? c.email}
                      </p>
                    </div>
                    {c.unread_count > 0 && (
                      <span className="w-5 h-5 bg-[#004B57] text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {c.unread_count > 9 ? '9+' : c.unread_count}
                      </span>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* ── Область чата ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="w-16 h-16 bg-[#004B57]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-[#004B57]" />
                </div>
                <p className="font-semibold text-gray-600">Выберите клиента</p>
                <p className="text-sm text-gray-400 mt-1">
                  {clients.length === 0
                    ? 'Ждите первого сообщения от клиента'
                    : 'Выберите клиента из списка слева'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3 bg-white">
                <div className="relative">
                  <Avatar name={selected.name} size={10} />
                  <Circle size={9} className="absolute -bottom-0.5 -right-0.5 fill-green-400 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">{selected.name}</p>
                  <p className="text-xs text-gray-400">{selected.email} · клиент</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-sm text-gray-400">Начните диалог с {selected.name}</p>
                  </div>
                ) : (
                  messages.map((m, i) => {
                    const isOwn = m.sender_id === user?.id
                    const showTime = i === 0 ||
                      (new Date(m.created_at).getTime() - new Date(messages[i-1].created_at).getTime()) > 5 * 60_000
                    return (
                      <div key={m.id}>
                        {showTime && (
                          <div className="text-center text-[10px] text-gray-400 my-2">
                            {fmtTime(m.created_at)}
                          </div>
                        )}
                        <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          {!isOwn && <Avatar name={selected.name} size={7} />}
                          <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isOwn
                              ? 'bg-[#004B57] text-white rounded-br-md'
                              : 'bg-white text-gray-800 shadow-sm rounded-bl-md'
                          }`}>
                            {m.text}
                            <div className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-gray-400'} text-right`}>
                              {new Date(m.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              {isOwn && <span className="ml-1">{m.is_read ? '✓✓' : '✓'}</span>}
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
              <div className="p-3 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={`Ответить ${selected.name}...`}
                    className="flex-1 bg-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#004B57]/30 transition-all"
                  />
                  <button
                    onClick={send}
                    disabled={!input.trim() || sending}
                    className="w-10 h-10 bg-[#004B57] hover:bg-[#003840] text-white rounded-xl flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
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
