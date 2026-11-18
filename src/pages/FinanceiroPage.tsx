import { motion } from 'framer-motion'
import { Wallet } from 'lucide-react'

export function FinanceiroPage() {
  return (
    <section className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        className="relative"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-sky/25 bg-sky/10 text-baby glow-sky"
        >
          <Wallet size={28} />
        </motion.div>

        <h1 className="font-display text-3xl font-bold tracking-tight text-snow sm:text-4xl">
          Financeiro
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-fog">
          Módulo em construção. Em breve você verá aqui o controle completo das finanças.
        </p>
      </motion.div>
    </section>
  )
}
