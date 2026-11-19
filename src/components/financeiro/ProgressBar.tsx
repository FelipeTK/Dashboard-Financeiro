import { motion } from 'framer-motion'

type ProgressBarProps = {
  value: number
  tone?: 'sky' | 'emerald' | 'amber' | 'rose'
}

const toneClass = {
  sky: 'bg-sky',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
}

export function ProgressBar({ value, tone = 'sky' }: ProgressBarProps) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-mist/70">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full ${toneClass[tone]}`}
      />
    </div>
  )
}
