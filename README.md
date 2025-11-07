# KG Chatbot Frontend

A modern Next.js frontend for the Knowledge-Grounded Chatbot application. This application provides a user-friendly interface for interacting with a knowledge base chatbot that can operate in two distinct modes: Knowledge Base (KB) only mode and LLM-augmented mode.

## Features

- ** Modern UI**: Clean, responsive design with dark mode support
- ** Real-time Chat**: Interactive chat interface with message history
- ** Toggle Control**: Switch between KB-only and LLM-augmented response modes
- ** Source Indicators**: Clear badges showing response source (KB, KB+LLM, LLM)
- ** Session Management**: 
  - Create and manage multiple conversation sessions
  - View conversation history in sidebar
  - Delete sessions with confirmation dialog
  - Automatic session persistence
- ** Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **⚡ Performance**: Optimized with Next.js 14 and React 18

##  Prerequisites

- **Node.js**: 18.0 or higher
- **npm** or **yarn**: Package manager
- **Backend API**: The FastAPI backend should be running (default: `http://localhost:8000`)

## 🚀 Getting Started

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
   
   Create a `.env.local` file in the `frontend/` directory:
```bash
cp env.example .env.local
```

   Update `.env.local` with your backend API URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# Or for production:
# NEXT_PUBLIC_API_URL=https://knowledge-grounded-chatbot.onrender.com
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will automatically reload when you make changes to the code.

### Production Build

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## 📁 Project Structure

```
frontend/
├── app/                    # Next.js 14 App Router
│   ├── layout.tsx         # Root layout with metadata
│   ├── page.tsx           # Main chat page component
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # React components
│   ├── ChatInput.tsx      # Message input component
│   ├── ChatMessage.tsx    # Individual message display
│   ├── LLMToggle.tsx      # Toggle switch for LLM mode
│   ├── SessionSidebar.tsx  # Sidebar with session list
│   └── ui/                # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── ...
├── lib/                   # Utility functions
│   ├── api.ts            # API client functions
│   └── utils.ts          # Helper utilities
├── types/                 # TypeScript type definitions
│   └── chat.ts           # Chat-related types
├── public/               # Static assets (if any)
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## 🔌 API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

### Chat Endpoints

- **`POST /chat`** - Send a message and get a response
  - Request: `{ message: string, enable_llm: boolean, session_id?: string }`
  - Response: `{ reply: string, source: string, session_id: string }`

### Session Endpoints

- **`GET /sessions`** - Get all chat sessions
- **`GET /sessions/{session_id}/messages`** - Get messages for a session
- **`POST /sessions`** - Create or get a session
- **`DELETE /sessions/{session_id}`** - Delete a session and all its messages

### Health Check

- **`GET /health`** - Check backend health status

All API functions are defined in `lib/api.ts`.

## 🎨 Features in Detail

### Chat Interface

- **Message Input**: 
  - Multi-line textarea with auto-resize
  - Send with Enter (Shift+Enter for new line)
  - Disabled state during loading
  
- **Message Display**:
  - User messages (right-aligned, primary color)
  - Assistant messages (left-aligned, with source badges)
  - Timestamps for each message (12-hour format with AM/PM)
  - Auto-scroll to latest message

- **Loading States**:
  - Typing indicator while waiting for response
  - Disabled input during processing

### Toggle Functionality

The **LLM Toggle** allows users to control response generation:

- **Toggle OFF (KB Only)**: 
  - Responses come strictly from the knowledge base
  - No LLM processing
  - Source badge: "Source: Internal Docs"
  
- **Toggle ON (LLM Enhanced)**:
  - Responses are augmented with LLM (Gemini)
  - Can use general knowledge if KB doesn't have answer
  - Source badges: "KB + LLM" or "General LLM Response"

### Session Management

- **Session Sidebar**:
  - Lists all conversation sessions
  - Shows preview of first message
  - Displays last active time and message count
  - Highlights currently active session
  - Mobile-responsive with overlay
  
- **Session Actions**:
  - **New Chat**: Creates a fresh conversation
  - **Select Session**: Loads conversation history
  - **Delete Session**: Removes session and all messages (with confirmation dialog)
  
- **Session Persistence**:
  - Sessions saved to backend database
  - Current session ID stored in localStorage
  - Automatic session restoration on page reload

### Source Indicators

Each assistant message displays a source badge:

- ** Source: Internal Docs** - KB-only response (no LLM)
- ** KB + LLM** - Knowledge base augmented with LLM
- ** General LLM Response** - LLM-only response (no KB context)

## Styling

The application uses **Tailwind CSS** for styling:

- **Color Scheme**: Custom primary colors with dark mode support
- **Responsive Design**: Mobile-first approach with breakpoints
- **Dark Mode**: Automatic based on system preference
- **Animations**: Smooth transitions and loading states
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Customization

To customize colors, edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        600: '#your-color',
        // ...
      }
    }
  }
}
```

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Code Structure

- **Components**: Functional React components with TypeScript
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API Calls**: Async/await with error handling
- **Type Safety**: Full TypeScript coverage

### Adding New Features

1. **New Component**: Add to `components/` directory
2. **API Function**: Add to `lib/api.ts`
3. **Type Definition**: Add to `types/` directory
4. **Route**: Use Next.js App Router in `app/` directory

## Troubleshooting

### Backend Connection Issues

- Verify backend is running: Check `http://localhost:8000/health`
- Check `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
- Check CORS settings in backend if accessing from different origin

### Build Errors

- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

### Session Not Loading

- Check browser console for errors
- Verify backend session endpoints are working
- Check localStorage for session ID conflicts

### Delete Session Not Working

- Ensure backend DELETE endpoint is deployed
- Check browser console for 404 errors
- Verify session ID is correct

##  Dependencies

### Key Dependencies

- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library (for UI components)

See `package.json` for complete list.

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable: `NEXT_PUBLIC_API_URL`
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable in your deployment platform.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://knowledge-grounded-chatbot.onrender.com` |

**Note**: In Next.js, environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## How It Works

### Toggle Flow

1. **User toggles LLM mode ON/OFF**
2. **Frontend sends `enable_llm` flag** with each message
3. **Backend routes** based on toggle state:
   - `enable_llm: false` → KB-only mode (strict retrieval)
   - `enable_llm: true` → LLM-augmented mode (RAG)
4. **Response includes source** indicating which mode was used

### Session Flow

1. **First message** creates a new session (or uses existing if session_id provided)
2. **Session ID** stored in localStorage and sent with subsequent messages
3. **Messages** are saved to backend database
4. **Sidebar** displays all sessions with preview
5. **User can switch** between sessions or delete them

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license here]

## 🔗 Related

- [Backend README](../backend/README.md)
- [Backend Architecture](../backend/ARCHITECTURE.md)
