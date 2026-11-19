import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { isNavItemActive, type NavItem } from '../../config/navigation'
import { useSidebar } from '../../context/SidebarContext'

type SidebarNavItemProps = {
  item: NavItem
  index: number
  isCollapsed: boolean
  isMobile: boolean
}

export function SidebarNavItem({ item, index, isCollapsed, isMobile }: SidebarNavItemProps) {
  const location = useLocation()
  const { closeMobile, setCollapsed } = useSidebar()
  const hasChildren = Boolean(item.children?.length)
  const active = isNavItemActive(location.pathname, item)
  const [open, setOpen] = useState(active)
  const [flyout, setFlyout] = useState(false)

  useEffect(() => {
    if (active) setOpen(true)
  }, [active, location.pathname])

  useEffect(() => {
    if (isCollapsed) setFlyout(false)
  }, [isCollapsed])

  const Icon = item.icon

  if (!hasChildren) {
    return (
      <NavLink
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
              isActive ? 'bg-sky/15 text-baby' : 'text-fog hover:bg-mist/50 hover:text-cloud'
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
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => isCollapsed && setFlyout(true)}
      onMouseLeave={() => isCollapsed && setFlyout(false)}
    >
      <button
        type="button"
        onClick={() => {
          if (isCollapsed) {
            setCollapsed(false)
            setOpen(true)
            return
          }
          setOpen((prev) => !prev)
        }}
        className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-colors ${
          active ? 'bg-sky/10 text-baby' : 'text-fog hover:bg-mist/50 hover:text-cloud'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
        aria-expanded={open}
      >
        <span
          className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
            active ? 'bg-sky/20 text-baby' : 'bg-elevated/80 text-fog group-hover:text-sky'
          }`}
        >
          <Icon size={18} strokeWidth={active ? 2.25 : 1.75} />
        </span>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              key="parent-label"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              className="relative z-10 flex min-w-0 flex-1 items-center justify-between gap-2"
            >
              <span className="truncate text-sm font-medium tracking-wide">{item.label}</span>
              <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={14} className="text-fog" />
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence initial={false}>
        {!isCollapsed && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="relative ml-5 mt-1 space-y-1 border-l border-line-soft pl-3">
              {item.children!.map((child) => {
                const ChildIcon = child.icon
                return (
                  <NavLink
                    key={child.id}
                    to={child.path}
                    onClick={isMobile ? closeMobile : undefined}
                    className="group/child block"
                  >
                    {({ isActive }) => (
                      <div
                        className={`relative flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm transition ${
                          isActive
                            ? 'bg-sky/15 text-baby'
                            : 'text-fog hover:bg-mist/40 hover:text-cloud'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId={isMobile ? 'nav-sub-active-mobile' : 'nav-sub-active'}
                            className="absolute inset-0 rounded-xl border border-sky/20 bg-sky/10"
                            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                          />
                        )}
                        <ChildIcon size={15} className="relative z-10 shrink-0" />
                        <span className="relative z-10 truncate font-medium">{child.label}</span>
                      </div>
                    )}
                  </NavLink>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCollapsed && flyout && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            className="absolute left-[calc(100%+0.55rem)] top-0 z-50 hidden w-56 overflow-hidden rounded-2xl border border-line bg-surface/95 p-2 shadow-2xl shadow-void/50 backdrop-blur-xl lg:block"
          >
            <p className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-fog">
              {item.label}
            </p>
            {item.children!.map((child) => {
              const ChildIcon = child.icon
              return (
                <NavLink
                  key={child.id}
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-sky/15 text-baby'
                        : 'text-cloud hover:bg-mist/50'
                    }`
                  }
                >
                  <ChildIcon size={15} />
                  <span>{child.label}</span>
                </NavLink>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
