import type { Message } from '@/types/chat'

interface ChatMessageProps {
  message: Message
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const sourceBadge = message.source && message.source !== 'error' ? (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mt-2 ${
      message.source === 'KB' 
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : message.source === 'KB+LLM'
        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    }`}>
      {message.source === 'KB' && 'Source: Internal Docs'}
      {message.source === 'KB+LLM' && 'KB + LLM'}
      {message.source === 'LLM' && 'General LLM Response'}
    </span>
  ) : null

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {!isUser && sourceBadge}
        <div className={`text-xs mt-1 ${
          isUser ? 'text-primary-100' : 'text-slate-500 dark:text-slate-400'
        }`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  )
}

