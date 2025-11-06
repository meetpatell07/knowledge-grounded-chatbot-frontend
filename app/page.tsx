'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import SessionSidebar from '@/components/SessionSidebar'
import { sendMessage, getSessionMessages, type APIMessage } from '@/lib/api'
import type { Message } from '@/types/chat'
import type { SourceType } from '@/lib/api'
import LLMToggle from '@/components/LLMToggle'

const SESSION_STORAGE_KEY = 'kg-chatbot-session-id'

// Extended Message type with ID for React keys
interface MessageWithId extends Message {
  id: string
  isTemporary?: boolean // Track if message is temporary (not yet saved)
}

export default function Home() {
  const [messages, setMessages] = useState<MessageWithId[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false) // Prevent concurrent loads
  const [enableLLM, setEnableLLM] = useState(false)

  // Save session to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId)
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  }, [sessionId])

  // Convert APIMessage to MessageWithId format
  const convertAPIMessage = useCallback((msg: APIMessage): MessageWithId => {
    return {
      id: msg.id, // Use actual message ID from API
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      source: (msg.source as SourceType) || undefined,
      timestamp: new Date(msg.createdAt),
      isTemporary: false,
    }
  }, [])

  // Load messages for a session
  const loadSessionMessages = useCallback(async (id: string, merge: boolean = false) => {
    // Prevent concurrent loads
    if (loadingRef.current) return
    loadingRef.current = true
    
    setIsLoadingMessages(true)
    try {
      const apiMessages = await getSessionMessages(id)
      const convertedMessages = apiMessages.map(convertAPIMessage)
      
      if (merge) {
        // Merge with existing messages, keeping temporary ones
        setMessages((prev) => {
          const existingIds = new Set(prev.map(m => m.id))
          const newMessages = convertedMessages.filter(m => !existingIds.has(m.id))
          // Keep temporary messages and add new ones
          return [...prev.filter(m => m.isTemporary), ...convertedMessages]
        })
      } else {
        // Replace all messages (for session switch)
        setMessages(convertedMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
      // Don't clear messages on error - keep what we have
    } finally {
      setIsLoadingMessages(false)
      loadingRef.current = false
    }
  }, [convertAPIMessage])
  
  // Load session from localStorage on mount
  useEffect(() => {
    const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY)
    if (savedSessionId) {
      setSessionId(savedSessionId)
      loadSessionMessages(savedSessionId, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const scrollToBottom = useCallback(() => {
    // Check if ref exists and is in the DOM
    if (messagesEndRef.current) {
      try {
        // Use setTimeout to ensure DOM is fully updated
        setTimeout(() => {
          if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
          }
        }, 50)
      } catch (error) {
        // Fallback: scroll container directly
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        }
      }
    } else if (messagesContainerRef.current) {
      // Fallback: scroll container directly
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    // Generate temporary ID for user message
    const tempUserId = `temp-user-${Date.now()}-${Math.random()}`
    const userMessage: MessageWithId = {
      id: tempUserId,
      role: 'user',
      content: message,
      timestamp: new Date(),
      isTemporary: true,
    }

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await sendMessage(sessionId || undefined, message, enableLLM)  // Update this line
      
      // Generate temporary ID for assistant message
      const tempAssistantId = `temp-assistant-${Date.now()}-${Math.random()}`
      const assistantMessage: MessageWithId = {
        id: tempAssistantId,
        role: 'assistant',
        content: response.reply,
        source: response.source,
        timestamp: new Date(),
        isTemporary: true,
      }

      // Add assistant message immediately
      setMessages((prev) => [...prev, assistantMessage])
      
      // Update session ID if it's a new session
      const isNewSession = !sessionId || sessionId !== response.session_id
      if (isNewSession) {
        setSessionId(response.session_id)
      }

      // Reload messages from server after a short delay to get real IDs
      // This replaces temporary messages with real ones
      if (response.session_id) {
        setTimeout(() => {
          loadSessionMessages(response.session_id, false)
        }, 500)
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: MessageWithId = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error 
          ? `Sorry, I encountered an error: ${error.message}. Please try again.`
          : 'Sorry, I encountered an error. Please try again.',
        source: 'error',
        timestamp: new Date(),
        isTemporary: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewSession = () => {
    setMessages([])
    setSessionId(null)
    loadingRef.current = false
  }

  const handleSelectSession = async (id: string | null) => {
    if (id) {
      setSessionId(id)
      await loadSessionMessages(id, false)
    } else {
      setMessages([])
      setSessionId(null)
      loadingRef.current = false
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
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6"
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Only show loading spinner when there are no messages */}
            {isLoadingMessages && messages.length === 0 ? (
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
                  Ask me anything about the knowledge base. I&apos;ll help you find the information you need.
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </>
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
            {/* Always render the ref element, even when empty */}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>
        </div>

        {/* Input Container */}
        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
            <LLMToggle 
              enabled={enableLLM} 
              onChange={setEnableLLM}
              disabled={isLoading}
            />
            <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}