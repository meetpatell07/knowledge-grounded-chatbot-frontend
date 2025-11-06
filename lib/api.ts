const API_URL = process.env.API_URL || 'http://localhost:8000'
// Remove PRISMA_API_URL - no longer needed
// const PRISMA_API_URL = process.env.NEXT_PUBLIC_PRISMA_API_URL || 'http://localhost:4000'

export interface ChatRequest {
  session_id?: string
  message: string
}

export type SourceType = 'KB' | 'KB+LLM' | 'LLM' | 'error'

export interface ChatResponse {
  reply: string
  source: SourceType
  session_id: string
}

export async function sendMessage(
  sessionId: string | undefined,
  message: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      session_id: sessionId,
      message,
    } as ChatRequest),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  const data = await response.json()
  // Validate and normalize source value
  const validSources: SourceType[] = ['KB', 'KB+LLM', 'LLM', 'error']
  const source: SourceType = validSources.includes(data.source) ? data.source : 'LLM'
  
  return {
    ...data,
    source,
  }
}

export async function checkHealth(): Promise<{ status: string; database?: string; error?: string }> {
  const response = await fetch(`${API_URL}/health`)
  if (!response.ok) {
    throw new Error('Health check failed')
  }
  return response.json()
}

// Session and message management
export interface Session {
  id: string
  userId: string | null
  createdAt: string
  lastActive: string
  messages: APIMessage[]
}

export interface APIMessage {
  id: string
  sessionId: string
  role: string
  content: string
  source: string | null
  createdAt: string
}

export async function getAllSessions(): Promise<Session[]> {
  const response = await fetch(`${API_URL}/sessions`)
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`)
  }
  return response.json()
}

export async function getSessionMessages(sessionId: string): Promise<APIMessage[]> {
  const response = await fetch(`${API_URL}/sessions/${sessionId}/messages`)
  if (!response.ok) {
    throw new Error(`Failed to fetch messages: ${response.statusText}`)
  }
  return response.json()
}

