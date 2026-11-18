import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchNavItems, type NavItem } from '../../config/navigation'

export function SearchBar() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => searchNavItems(query), [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query, open])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  const goTo = (item: NavItem) => {
    navigate(item.path)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (!open && event.key !== 'Escape') setOpen(true)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => Math.min(prev + 1, Math.max(results.length - 1, 0)))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => Math.max(prev - 1, 0))
    }
    if (event.key === 'Enter' && results[activeIndex]) {
      event.preventDefault()
      goTo(results[activeIndex])
    }
    if (event.key === 'Escape') {
      setOpen(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <motion.div
        layout
        className={`group relative flex items-center gap-2 rounded-xl border bg-elevated/70 px-3 transition-all ${
          open
            ? 'border-sky/40 glow-sky'
            : 'border-line-soft hover:border-line'
        }`}
      >
        <Search
          size={16}
          className={`shrink-0 transition ${open ? 'text-sky' : 'text-fog group-hover:text-cloud'}`}
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar menus..."
          aria-label="Buscar itens de menu"
          className="h-10 w-full bg-transparent text-sm text-snow placeholder:text-fog/70 outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            className="rounded-md p-1 text-fog transition hover:bg-mist/70 hover:text-snow"
            aria-label="Limpar busca"
          >
            <X size={14} />
          </button>
        ) : (
          <kbd className="hidden rounded-md border border-line-soft bg-panel px-1.5 py-0.5 text-[10px] font-medium text-fog sm:inline">
            ⌘K
          </kbd>
        )}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-2xl border border-line bg-surface/95 shadow-2xl shadow-void/50 backdrop-blur-xl"
          >
            <div className="border-b border-line-soft px-3 py-2 text-[11px] font-medium uppercase tracking-[0.16em] text-fog">
              Navegação rápida
            </div>

            <ul className="max-h-64 overflow-auto p-2 scrollbar-thin">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-fog">
                  Nenhum menu encontrado
                </li>
              )}

              {results.map((item, index) => {
                const Icon = item.icon
                const active = index === activeIndex
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goTo(item)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        active
                          ? 'bg-sky/15 text-baby'
                          : 'text-cloud hover:bg-mist/40'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          active ? 'bg-sky/20 text-baby' : 'bg-elevated text-fog'
                        }`}
                      >
                        <Icon size={16} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{item.label}</span>
                        <span className="block text-xs text-fog">{item.path}</span>
                      </span>
                      {active && <CornerDownLeft size={14} className="text-sky" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
