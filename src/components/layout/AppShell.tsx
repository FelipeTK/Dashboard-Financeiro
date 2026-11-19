import { AnimatePresence, motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'
import { useSidebar } from '../../context/SidebarContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const { mobileOpen, closeMobile } = useSidebar()
  const location = useLocation()

  return (
    <div className="relative flex h-dvh overflow-hidden bg-ink text-snow">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-80 w-80 rounded-full bg-sky/20 blur-3xl animate-aurora" />
        <div
          className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-cobalt/25 blur-3xl animate-aurora"
          style={{ animationDelay: '-6s' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--color-line)_55%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--color-line)_55%,transparent)_1px,transparent_1px)] bg-[size:48px_48px] opacity-35" />
      </div>

      <div className="relative z-20 hidden h-full lg:block">
        <Sidebar variant="desktop" />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Fechar menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobile}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar variant="mobile" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="relative flex-1 overflow-auto scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto h-full w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
