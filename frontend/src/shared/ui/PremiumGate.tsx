import { useNavigate } from 'react-router-dom'

// ── inline badge ──────────────────────────────────────────────────────────────

export function ProBadge() {
  return (
    <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
      Pro
    </span>
  )
}

// ── locked section block ──────────────────────────────────────────────────────

interface PremiumGateProps {
  /** Feature name shown as heading */
  feature: string
  /** One-line description of what the feature does */
  description: string
  /** Label for the upgrade button (default: "Upgrade to Pro") */
  ctaLabel?: string
}

export function PremiumGate({
  feature,
  description,
  ctaLabel = 'Upgrade to Pro',
}: PremiumGateProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border border-dashed border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-base select-none" aria-hidden>🔒</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{feature}</p>
            <ProBadge />
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {description}
          </p>
          <button
            onClick={() => navigate('/billing')}
            className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
