import { AnimatePresence, motion } from 'framer-motion'
import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../config/navigation'
import { useSidebar } from '../../context/SidebarContext'

type SidebarProps = {
  variant?: 'desktop' | 'mobile'
}

export function Sidebar({ variant = 'desktop' }: SidebarProps) {
  const { collapsed, toggleCollapsed, closeMobile } = useSidebar()
  const isMobile = variant === 'mobile'
  const isCollapsed = isMobile ? false : collapsed

  return (
    <motion.aside
      initial={false}
      animate={{ width: isMobile ? 280 : isCollapsed ? 84 : 260 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="relative z-40 flex h-full flex-col overflow-hidden border-r border-line-soft bg-panel/90 backdrop-blur-xl"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(126,184,255,0.12),transparent_55%)]" />

      <div className="relative flex h-16 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <motion.div
            layout
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky/30 to-navy glow-sky"
          >
            <span className="font-display text-sm font-bold tracking-tight text-baby">DF</span>
          </motion.div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <p className="truncate font-display text-sm font-bold tracking-wide text-snow">
                  Dashboard
                </p>
                <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-fog">
                  Financeiro
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isMobile ? (
          <button
            type="button"
            onClick={closeMobile}
            className="rounded-lg p-2 text-fog transition hover:bg-mist/60 hover:text-snow"
            aria-label="Fechar menu"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            type="button"
            onClick={toggleCollapsed}
            className="rounded-lg p-2 text-fog transition hover:bg-mist/60 hover:text-sky"
            aria-label={isCollapsed ? 'Expandir menu' : 'Retrair menu'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      <nav className="relative mt-2 flex flex-1 flex-col gap-1 px-3 pb-6">
        <p
          className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-fog/70 ${
            isCollapsed ? 'text-center' : ''
          }`}
        >
          {isCollapsed ? '···' : 'Menu'}
        </p>

        {NAV_ITEMS.map((item, index) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={isMobile ? closeMobile : undefined}
              className="group relative block"
            >
              {({ isActive }) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.35 }}
                  className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-colors ${
                    isActive
                      ? 'bg-sky/15 text-baby'
                      : 'text-fog hover:bg-mist/50 hover:text-cloud'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId={isMobile ? 'nav-active-mobile' : 'nav-active'}
                      className="absolute inset-0 rounded-xl border border-sky/25 bg-gradient-to-r from-sky/20 via-sky/10 to-transparent"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  )}

                  <span
                    className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                      isActive
                        ? 'bg-sky/20 text-baby'
                        : 'bg-elevated/80 text-fog group-hover:text-sky'
                    }`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.25 : 1.75} />
                  </span>

                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span
                        key="label"
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.18 }}
                        className="relative z-10 truncate text-sm font-medium tracking-wide"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {isCollapsed && (
                    <span className="pointer-events-none absolute left-full z-50 ml-3 hidden whitespace-nowrap rounded-lg border border-line bg-elevated px-2.5 py-1.5 text-xs font-medium text-snow opacity-0 shadow-xl transition group-hover:opacity-100 lg:block">
                      {item.label}
                    </span>
                  )}
                </motion.div>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="relative border-t border-line-soft p-4">
        <AnimatePresence initial={false} mode="wait">
          {isCollapsed ? (
            <motion.div
              key="mini"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <div className="h-2 w-2 rounded-full bg-sky animate-pulse-soft" />
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="rounded-xl border border-line-soft bg-elevated/60 px-3 py-3"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-fog">
                Status
              </p>
              <p className="mt-1 text-sm text-cloud">Sistema online</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  )
}

export function MobileMenuButton() {
  const { toggleMobile } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggleMobile}
      className="rounded-xl border border-line-soft bg-elevated/70 p-2.5 text-fog transition hover:border-sky/30 hover:text-sky lg:hidden"
      aria-label="Abrir menu"
    >
      <Menu size={18} />
    </button>
  )
}
