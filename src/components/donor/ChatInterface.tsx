import { useState } from 'react'
import { Send, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { useChat } from '../../hooks/useChat'

export function ChatInterface() {
  const [text, setText] = useState('')
  const { threads, activeThreadId, setActiveThreadId, messages, sendMessage, activeThread, getOtherParticipant, user } = useChat()

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(text)
    setText('')
  }

  if (threads.length === 0) {
    return (
      <div className="glass-card flex flex-col h-[520px] overflow-hidden items-center justify-center text-text-secondary p-8 text-center">
        <Users className="w-12 h-12 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Active Conversations</h3>
        <p className="text-sm">When you approve a pickup request, you can chat with the NGO here to coordinate logistics.</p>
      </div>
    )
  }

  const otherUser = activeThread ? getOtherParticipant(activeThread) : null

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-[520px]">
      <div className="glass-card flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold">Conversations</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {threads.map(thread => {
            const participant = getOtherParticipant(thread)
            return (
              <button
                key={thread.id}
                onClick={() => setActiveThreadId(thread.id)}
                className={`w-full text-left p-3 rounded-xl flex flex-col gap-1 transition-colors mb-1 ${
                  activeThreadId === thread.id ? 'bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex justify-between items-baseline">
                  <h4 className="font-semibold text-sm truncate">{participant?.name || 'Unknown'}</h4>
                </div>
                <p className="text-xs text-text-secondary truncate">{thread.lastMessagePreview || 'No messages yet'}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden">
        {activeThreadId ? (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-text dark:text-white">{otherUser?.name || 'Chat'}</h3>
                  <p className="text-xs text-text-secondary">{otherUser?.role === 'receiver' ? 'Recipient Org' : 'Donor'}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      isMe
                        ? 'bg-primary text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 rounded-bl-md'
                    }`}>
                      {!isMe && (
                        <p className="text-xs font-semibold mb-1 opacity-80">{msg.senderName}</p>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-1 text-[10px] ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
                        <span>{msg.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message..."
                  className="input-field flex-1"
                />
                <Button variant="primary" icon={Send} onClick={handleSend}>Send</Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-secondary">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  )
}
