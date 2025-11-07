'use client'

import { useEffect, useState } from 'react'
import { getAllSessions, deleteSession, type Session } from '@/lib/api'

interface SessionSidebarProps {
  currentSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
  onNewSession: () => void
}

export default function SessionSidebar({
  currentSessionId,
  onSelectSession,
  onNewSession,
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(true)
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const data = await getAllSessions()
      setSessions(data)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingSessionId(sessionId)
      await deleteSession(sessionId)
      
      // If deleted session is current, clear it
      if (currentSessionId === sessionId) {
        onSelectSession(null)
      }
      
      // Reload sessions list
      await loadSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete session'
      
      // More user-friendly error message
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        alert('Delete endpoint not available. Please ensure the backend is updated and deployed.')
      } else {
        alert(`Failed to delete session: ${errorMessage}`)
      }
    } finally {
      setDeletingSessionId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getPreview = (session: Session) => {
    if (session.messages.length === 0) return 'New conversation'
    const firstUserMessage = session.messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
    }
    return 'New conversation'
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
      >
        <svg
          className="w-6 h-6 text-slate-700 dark:text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-transform duration-300`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Chat History
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => {
              onNewSession()
              setIsOpen(false)
            }}
            className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              Loading sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-4 text-center text-slate-500 dark:text-slate-400">
              No conversations yet
            </div>
          ) : (
            <div className="p-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative w-full p-3 rounded-lg mb-2 transition-colors ${
                    currentSessionId === session.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300 dark:border-primary-700'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectSession(session.id)
                      setIsOpen(false)
                    }}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-2 pr-6">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {getPreview(session)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {formatDate(session.lastActive)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {session.messages.length} messages
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    disabled={deletingSessionId === session.id}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete conversation"
                  >
                    {deletingSessionId === session.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}


