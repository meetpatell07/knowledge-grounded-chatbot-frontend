'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import SessionSidebar from '@/components/SessionSidebar'
import { sendMessage, getSessionMessages, type PrismaMessage } from '@/lib/api'
import type { Message } from '@/types/chat'
import type { SourceType } from '@/lib/api'

const SESSION_STORAGE_KEY = 'kg-chatbot-session-id'

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load session from localStorage on mount
  // useEffect(() => {
  //   const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
  //   if (savedSessionId) {
  //     setSessionId(savedSessionId)
  //     loadSessionMessages(savedSessionId)
  //   }
  // }, [])
  

  // Save session to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [sessionId])

  // Convert PrismaMessage to Message format
  const convertPrismaMessage = (msg: PrismaMessage): Message => {
    return {
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      source: (msg.source as SourceType) || undefined,
      timestamp: new Date(msg.createdAt),
    }
  }

  // Load messages for a session
  const loadSessionMessages = async (id: string) => {
    setIsLoadingMessages(true)
    try {
      const prismaMessages = await getSessionMessages(id)
      const convertedMessages = prismaMessages.map(convertPrismaMessage)
      setMessages(convertedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }
  
  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    if (savedSessionId) {
      setSessionId(savedSessionId)
      loadSessionMessages(savedSessionId)
    }
  }, [loadSessionMessages]) // <-- Added loadSessionMessages here

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendMessage(sessionId || undefined, message)
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.reply,
        source: response.source,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      
      // Update session ID if it's a new session
      if (!sessionId || sessionId !== response.session_id) {
        setSessionId(response.session_id)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        source: 'error',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSession = () => {
    setMessages([])
    setSessionId(null)
  }

  const handleSelectSession = async (id: string | null) => {
    if (id) {
      setSessionId(id)
      await loadSessionMessages(id)
    } else {
      setMessages([])
      setSessionId(null)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <SessionSidebar
        currentSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                KG Chatbot
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Knowledge Base Assistant
              </p>
            </div>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                <p className="text-slate-500 dark:text-slate-400">Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="mb-4">
                <svg
                  className="w-16 h-16 text-slate-400 dark:text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Start a conversation
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md">
              Ask me anything about the knowledge base. **I&apos;ll** help you find the information you need.              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Container */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

