# Frontend Architecture

This document explains the frontend architecture, technology choices, and the logic for switching between Knowledge Base (KB) only and LLM-augmented response pathways.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js 14)                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  User Interface Components                                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │ ChatInput     │  │ LLMToggle    │  │SessionSidebar│   │  │
│  │  │ Component     │  │ Component    │  │ Component    │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  └─────────┼──────────────────┼──────────────────┼──────────┘  │
│            │                  │                  │             │
│            ▼                  ▼                  ▼             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Main Page Component (app/page.tsx)                       │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  State Management:                                 │  │  │
│  │  │  - messages: MessageWithId[]                       │  │  │
│  │  │  - sessionId: string | null                        │  │  │
│  │  │  - enableLLM: boolean  ◄─── Toggle State          │  │  │
│  │  │  - isLoading: boolean                             │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │                          │                               │  │
│  │                          ▼                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Event Handlers:                                    │  │  │
│  │  │  - handleSendMessage(message)                       │  │  │
│  │  │    └─► sendMessage(..., enableLLM)                  │  │  │
│  │  │  - handleSelectSession(sessionId)                   │  │  │
│  │  │  - handleDeleteSession(sessionId)                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Client Layer (lib/api.ts)                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  sendMessage(sessionId, message, enableLLM)         │  │  │
│  │  │    └─► POST /chat                                   │  │  │
│  │  │        {                                            │  │  │
│  │  │          message: string,                          │  │  │
│  │  │          enable_llm: boolean,  ◄─── Key Parameter  │  │  │
│  │  │          session_id?: string                        │  │  │
│  │  │        }                                            │  │  │
│  │  │                                                      │  │  │
│  │  │  getAllSessions()                                   │  │  │
│  │  │  getSessionMessages(sessionId)                      │  │  │
│  │  │  deleteSession(sessionId)                           │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────┬───────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTTP REST API                                           │  │
│  │  POST /chat → Backend FastAPI                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Response Processing                                     │  │
│  │  {                                                        │  │
│  │    reply: string,                                        │  │
│  │    source: "KB" | "KB+LLM" | "LLM",  ◄─── Source Label  │  │
│  │    session_id: string                                    │  │
│  │  }                                                        │  │
│  │                                                           │  │
│  │  └─► Display with ChatMessage component                  │  │
│  │      └─► Show source badge based on source value        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Justification

### Next.js 14

**Why Next.js?**

- **App Router**: Modern file-based routing system with server components support
- **Performance**: Built-in optimizations including automatic code splitting, image optimization, and static generation
- **Developer Experience**: Hot module replacement, excellent TypeScript support, comprehensive tooling
- **Production Ready**: Optimized builds with minimal configuration
- **SEO Friendly**: Server-side rendering capabilities for better SEO
- **API Routes**: Can handle API endpoints if needed (though we use external backend)
- **Deployment**: Easy deployment on Vercel, Netlify, and other platforms

**Alternatives Considered**: 
- **Create React App**: Less modern, requires additional routing setup, no built-in optimizations
- **Vite + React Router**: Faster dev server but requires more configuration for production optimizations
- **Remix**: More opinionated, less flexible

**Rejected**: Next.js provides the best balance of developer experience, performance, and production readiness.

### React 18

**Why React?**

- **Component-Based Architecture**: Modular, reusable UI components
- **State Management**: Built-in hooks (useState, useEffect, useCallback) sufficient for this application's state needs
- **Ecosystem**: Largest JavaScript library ecosystem, extensive community support
- **Performance**: Virtual DOM for efficient updates, React 18 improvements (concurrent rendering)
- **TypeScript Integration**: Excellent TypeScript support with type inference
- **Maturity**: Battle-tested, widely adopted, stable API

**Alternatives Considered**: 
- **Vue.js**: Smaller ecosystem, less TypeScript support
- **Angular**: Heavier framework, more complex for this use case
- **Svelte**: Smaller ecosystem, less mature tooling

**Rejected**: React has the largest ecosystem, best TypeScript integration, and most resources available.

### TypeScript

**Why TypeScript?**

- **Type Safety**: Catch errors at compile time, prevent runtime errors
- **Better IDE Support**: Autocomplete, refactoring, navigation, inline documentation
- **Self-Documenting Code**: Types serve as inline documentation
- **Maintainability**: Easier to maintain and scale, especially with API contracts
- **API Contracts**: Enforces consistency between frontend and backend interfaces
- **Refactoring**: Safer refactoring with type checking

**Alternatives Considered**: JavaScript
- **Rejected**: Type safety is crucial for API integration, state management, and catching errors early

### Tailwind CSS

**Why Tailwind CSS?**

- **Utility-First**: Rapid UI development without writing custom CSS
- **Consistency**: Design system enforced through utility classes
- **Dark Mode**: Built-in dark mode support with `dark:` prefix
- **Responsive Design**: Mobile-first responsive utilities (`sm:`, `md:`, `lg:`)
- **Performance**: Purges unused CSS in production, resulting in smaller bundle sizes
- **Maintainability**: No CSS file sprawl, styles co-located with components
- **Customization**: Easy to customize through `tailwind.config.js`

**Alternatives Considered**: 
- **CSS Modules**: Requires writing CSS, more verbose
- **Styled Components**: Runtime CSS-in-JS, larger bundle size
- **Sass/Less**: Traditional CSS preprocessors, more setup required

**Rejected**: Tailwind provides faster development, better consistency, and smaller production bundles.

### State Management: React Hooks

**Why React Hooks (not Redux/Zustand)?**

- **Simplicity**: Application state is straightforward (messages, session, toggle, loading)
- **No External Dependency**: Built into React, no additional library needed
- **Performance**: useCallback and useMemo hooks for optimization when needed
- **Local Storage**: Simple persistence with useEffect hook
- **Sufficient**: No complex state management needs (no global state, no time-travel debugging needed)

**When to Consider Redux/Zustand**: 
- If state becomes complex with multiple stores
- If time-travel debugging is needed
- If state needs to be shared across many components

**Current Approach**: 
- Component-level state with useState
- Shared state passed via props
- localStorage for persistence

## Response Pathway Switching Logic

The frontend implements a **user-controlled toggle** that switches between two distinct response pathways by sending the `enable_llm` flag to the backend.

### Complete Frontend Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                              │
│  1. User types message in ChatInput                             │
│  2. User toggles LLM mode ON/OFF via LLMToggle                  │
│  3. User clicks Send or presses Enter                           │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              State Management (app/page.tsx)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  const [enableLLM, setEnableLLM] = useState(false)       │  │
│  │  ◄─── Toggle state stored in component                    │  │
│  │                                                           │  │
│  │  handleSendMessage(message) {                             │  │
│  │    // Get current toggle state                            │  │
│  │    const currentToggleState = enableLLM                   │  │
│  │                                                           │  │
│  │    // Send to API with toggle state                       │  │
│  │    sendMessage(sessionId, message, currentToggleState)   │  │
│  │  }                                                         │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Client (lib/api.ts)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  sendMessage(                                            │  │
│  │    sessionId: string | undefined,                        │  │
│  │    message: string,                                       │  │
│  │    enableLLM: boolean  ◄─── Toggle state parameter       │  │
│  │  ) {                                                      │  │
│  │    fetch(`${API_URL}/chat`, {                            │  │
│  │      method: 'POST',                                      │  │
│  │      body: JSON.stringify({                              │  │
│  │        message,                                          │  │
│  │        enable_llm: enableLLM,  ◄─── Sent to backend     │  │
│  │        session_id: sessionId                             │  │
│  │      })                                                   │  │
│  │    })                                                     │  │
│  │  }                                                         │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Backend Processing                                  │
│  (See backend ARCHITECTURE.md for details)                      │
│  - Receives enable_llm flag                                     │
│  - Routes to KB-only or LLM-augmented based on flag             │
│  - Returns response with source label                           │
└───────────────────────────┬───────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              Response Handling (app/page.tsx)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Response: {                                              │  │
│  │    reply: "answer text",                                 │  │
│  │    source: "KB" | "KB+LLM" | "LLM",  ◄─── Source label   │  │
│  │    session_id: "uuid"                                     │  │
│  │  }                                                         │  │
│  │                                                           │  │
│  │  └─► Add message to state with source                     │  │
│  │      └─► Display with ChatMessage component               │  │
│  │          └─► Show source badge based on source value      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Toggle State Management

#### Component Structure

```typescript
// In app/page.tsx
export default function Home() {
  // Toggle state - controls response pathway
  const [enableLLM, setEnableLLM] = useState(false)  // Default: KB-only
  
  // Other state...
  const [messages, setMessages] = useState<MessageWithId[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  // Toggle component updates state
  <LLMToggle 
    enabled={enableLLM} 
    onChange={setEnableLLM}  // Updates toggle state
    disabled={isLoading}
  />
  
  // When sending message, include toggle state
  const handleSendMessage = async (message: string) => {
    // ...
    const response = await sendMessage(
      sessionId || undefined, 
      message, 
      enableLLM  // ← Current toggle state sent to backend
    )
    // ...
  }
}
```

#### Toggle Component

```typescript
// In components/LLMToggle.tsx
export default function LLMToggle({ enabled, onChange, disabled }) {
  return (
    <button
      onClick={() => onChange(!enabled)}  // Toggle state
      aria-checked={enabled}
    >
      {/* Visual toggle switch */}
    </button>
  )
}
```

### Switching Logic Flow

#### Scenario 1: Toggle OFF (enableLLM = false)

```
User Action
    │
    ├─► Toggle is OFF
    │
    ▼
handleSendMessage()
    │
    ├─► enableLLM = false
    │
    ▼
sendMessage(..., false)
    │
    ├─► POST /chat { enable_llm: false }
    │
    ▼
Backend Processing
    │
    ├─► evaluate_node() sees enable_llm = false
    │   └─► Always routes to kb_only_node
    │
    ▼
Response
    │
    ├─► { source: "KB" }
    │
    ▼
Display
    │
    └─► ChatMessage shows "Source: Internal Docs" badge
```

#### Scenario 2: Toggle ON (enableLLM = true)

```
User Action
    │
    ├─► Toggle is ON
    │
    ▼
handleSendMessage()
    │
    ├─► enableLLM = true
    │
    ▼
sendMessage(..., true)
    │
    ├─► POST /chat { enable_llm: true }
    │
    ▼
Backend Processing
    │
    ├─► evaluate_node() sees enable_llm = true
    │   ├─► If similarity high (distance < 0.35)
    │   │   └─► Routes to kb_only_node
    │   │       └─► source: "KB"
    │   │
    │   └─► If similarity low (distance >= 0.35)
    │       └─► Routes to llm_augmented_node
    │           └─► source: "KB+LLM" or "LLM"
    │
    ▼
Response
    │
    ├─► { source: "KB" | "KB+LLM" | "LLM" }
    │
    ▼
Display
    │
    └─► ChatMessage shows appropriate source badge
```

### Source Badge Display Logic

```typescript
// In components/ChatMessage.tsx
const sourceBadge = message.source && message.source !== 'error' ? (
  <span className={...}>
    {message.source === 'KB' && 'Source: Internal Docs'}
    {message.source === 'KB+LLM' && 'KB + LLM'}
    {message.source === 'LLM' && 'General LLM Response'}
  </span>
) : null
```

### Key Design Decisions

1. **Toggle State Per Message**: 
   - Each message is sent with the current toggle state at send time
   - User can change toggle between messages
   - Each response reflects the toggle state when that message was sent

2. **State Not Persisted**: 
   - Toggle state resets to `false` (KB-only) on page reload
   - User must explicitly set toggle for each session
   - This ensures user is aware of which mode they're using

3. **Source Transparency**: 
   - Every response includes a source label
   - Frontend displays appropriate badge
   - User always knows if answer came from KB, LLM, or both

4. **Optimistic UI Updates**: 
   - User message appears immediately
   - Assistant message appears after API response
   - Messages reloaded from server to get real IDs

## Component Architecture

### Component Hierarchy

```
app/page.tsx (Main Container)
├── SessionSidebar
│   ├── Session List (with delete buttons)
│   ├── New Chat Button
│   └── Session Selection
├── Messages Container
│   └── ChatMessage (for each message)
│       ├── Message Content
│       ├── Source Badge (conditional)
│       └── Timestamp
└── Input Area
    ├── LLMToggle
    │   └── Toggle Switch (controls enableLLM state)
    └── ChatInput
        └── Textarea + Send Button
```

### Data Flow Between Components

```
LLMToggle
    │
    │ onChange(setEnableLLM)
    │
    ▼
page.tsx (enableLLM state)
    │
    │ enableLLM value
    │
    ▼
handleSendMessage()
    │
    │ enableLLM parameter
    │
    ▼
sendMessage(..., enableLLM)
    │
    │ enable_llm in request
    │
    ▼
Backend API
    │
    │ source in response
    │
    ▼
ChatMessage
    │
    └─► Display source badge
```

## State Management

### State Structure

```typescript
// Main page state
{
  messages: MessageWithId[]        // All messages in current session
  sessionId: string | null         // Current session ID
  enableLLM: boolean               // Toggle state (KB-only vs LLM)
  isLoading: boolean               // Loading state
  isLoadingMessages: boolean       // Loading messages from server
}
```

### State Updates

1. **Toggle State**: Updated by LLMToggle component via `onChange` callback
2. **Messages**: Updated when:
   - User sends message (optimistic update)
   - API response received
   - Messages loaded from server
3. **Session ID**: Updated when:
   - New session created
   - Session selected from sidebar
   - Session loaded from localStorage

### Persistence

- **Session ID**: Stored in `localStorage` for restoration on page reload
- **Toggle State**: NOT persisted (resets to false on reload)
- **Messages**: Loaded from backend database, not stored locally

## API Integration

### Request Flow

```typescript
// User sends message
handleSendMessage(message)
  │
  ├─► Create temporary user message (optimistic UI)
  │
  ├─► Call API
  │   sendMessage(sessionId, message, enableLLM)
  │     │
  │     └─► POST /chat
  │         {
  │           message: "user query",
  │           enable_llm: true/false,  ◄─── Key switching parameter
  │           session_id: "uuid"
  │         }
  │
  ├─► Receive response
  │   {
  │     reply: "answer",
  │     source: "KB" | "KB+LLM" | "LLM",  ◄─── Indicates pathway used
  │     session_id: "uuid"
  │   }
  │
  └─► Update UI
      ├─► Add assistant message with source badge
      └─► Reload messages from server (to get real IDs)
```

## Performance Optimizations

1. **useCallback**: Memoize event handlers to prevent unnecessary re-renders
2. **useRef**: Store DOM references without causing re-renders
3. **Optimistic Updates**: Show messages immediately, sync with server later
4. **Code Splitting**: Next.js automatically splits code by route
5. **Image Optimization**: Next.js Image component (if images added)

## Security Considerations

1. **Environment Variables**: API URL in `NEXT_PUBLIC_*` (exposed to browser by design)
2. **Input Validation**: React's built-in XSS protection (automatic escaping)
3. **CORS**: Handled by backend CORS middleware
4. **No Sensitive Data**: No API keys or secrets in frontend code

## Future Enhancements

1. **State Management**: Consider Zustand if state becomes more complex
2. **Real-time Updates**: WebSocket for live message updates
3. **Offline Support**: Service workers for offline functionality
4. **Testing**: Add Jest + React Testing Library
5. **Error Boundaries**: Better error handling with React error boundaries
