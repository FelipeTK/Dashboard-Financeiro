import { motion } from 'framer-motion'

const USER_NAME = 'Felipe'

export function HomePage() {
  return (
    <section className="flex min-h-[calc(100dvh-8rem)] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative"
      >
        <div className="absolute -inset-16 rounded-full bg-sky/10 blur-3xl" />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-sky"
        >
          Bem-vindo de volta
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="relative font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="text-gradient">Bem Vindo {USER_NAME}!</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="relative mx-auto mt-5 max-w-md text-sm leading-relaxed text-fog sm:text-base"
        >
          Use o menu lateral ou a busca no topo para navegar pelas interfaces da plataforma.
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-8 h-px w-40 origin-center bg-gradient-to-r from-transparent via-sky to-transparent"
        />
      </motion.div>
    </section>
  )
}
