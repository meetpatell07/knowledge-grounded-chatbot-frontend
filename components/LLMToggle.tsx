'use client'

interface LLMToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  disabled?: boolean
}

export default function LLMToggle({ enabled, onChange, disabled }: LLMToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center space-x-3">
        <label
          htmlFor="llm-toggle"
          className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
        >
          Enable General LLM Responses
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {enabled ? 'AI-enhanced' : 'KB only'}
        </span>
      </div>
      <button
        id="llm-toggle"
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  )
}