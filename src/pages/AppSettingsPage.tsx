import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { PageHeader } from '../components/financeiro/PageHeader'
import { useTheme } from '../context/ThemeContext'

export function AppSettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <section>
      <PageHeader
        eyebrow="Sistema"
        title="Configurações"
        description="Personalize a aparência da plataforma e preferências gerais da interface."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl rounded-2xl border border-line-soft bg-elevated/45 p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fog">Tema</p>
        <p className="mt-1 text-sm text-cloud">Escolha entre o tema escuro padrão ou o tema claro.</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
              theme === 'dark'
                ? 'border-sky/40 bg-sky/15 text-baby glow-sky'
                : 'border-line-soft bg-panel/60 text-fog hover:border-line hover:text-cloud'
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/40">
              <Moon size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-snow">Escuro</span>
              <span className="block text-xs text-fog">Identidade azul-noturna</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
              theme === 'light'
                ? 'border-sky/40 bg-sky/15 text-baby glow-sky'
                : 'border-line-soft bg-panel/60 text-fog hover:border-line hover:text-cloud'
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink/40">
              <Sun size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-snow">Claro</span>
              <span className="block text-xs text-fog">Fundo claro com azuis suaves</span>
            </span>
          </button>
        </div>
      </motion.div>
    </section>
  )
}
