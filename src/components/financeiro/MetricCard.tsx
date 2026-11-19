import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  tone?: 'neutral' | 'positive' | 'negative' | 'accent'
  delay?: number
}

const toneMap = {
  neutral: 'from-elevated/80 to-panel/80 text-cloud',
  positive: 'from-emerald-500/10 to-elevated/80 text-emerald-300',
  negative: 'from-rose-500/10 to-elevated/80 text-rose-300',
  accent: 'from-sky/15 to-elevated/80 text-baby',
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      whileHover={{ y: -2 }}
      className={`rounded-2xl border border-line-soft bg-gradient-to-br p-4 ${toneMap[tone]}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-fog">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink/40 text-sky">
          <Icon size={16} />
        </span>
      </div>
      <p className="font-display text-2xl font-bold tracking-tight text-snow">{value}</p>
      {hint && <p className="mt-1 text-xs text-fog">{hint}</p>}
    </motion.div>
  )
}
