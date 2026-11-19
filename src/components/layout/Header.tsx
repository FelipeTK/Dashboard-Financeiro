import { motion } from 'framer-motion'
import { Bell, ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { AvatarEditorModal } from '../profile/AvatarEditorModal'
import { MobileMenuButton } from './Sidebar'
import { SearchBar } from './SearchBar'

export function Header() {
  const { profile, user, signOut, configured, refreshProfile } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário'
  const initial = displayName.slice(0, 1).toUpperCase()
  const avatarUrl = profile?.avatar_url ?? null

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  return (
    <>
      <header className="relative z-30 flex h-16 items-center justify-between gap-4 border-b border-line-soft bg-surface/70 px-4 backdrop-blur-xl sm:px-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky/30 to-transparent" />

        <div className="flex min-w-0 items-center gap-3">
          <MobileMenuButton />

          <div className="relative" ref={menuRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-line-soft hover:bg-elevated/70"
            >
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-9 w-9 rounded-full object-cover shadow-[0_0_18px_rgba(126,184,255,0.35)]"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky to-cobalt font-display text-sm font-bold text-ink shadow-[0_0_18px_rgba(126,184,255,0.35)]">
                    {initial}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-sky" />
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-medium text-snow">{displayName}</p>
                <p className="truncate text-[11px] text-fog">
                  {configured ? 'Conta conectada' : 'Modo local'}
                </p>
              </div>

              <ChevronDown size={14} className="hidden text-fog sm:block" />
            </motion.button>

            {menuOpen && (
              <div className="absolute left-0 top-[calc(100%+0.4rem)] z-50 w-56 overflow-hidden rounded-xl border border-line bg-surface/95 p-1 shadow-xl backdrop-blur-xl">
                {configured && user && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      setEditorOpen(true)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cloud transition hover:bg-mist/50 hover:text-sky"
                  >
                    <UserRound size={14} />
                    Editar perfil
                  </button>
                )}
                {configured && user && (
                  <button
                    type="button"
                    onClick={async () => {
                      setMenuOpen(false)
                      await signOut()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-cloud transition hover:bg-mist/50 hover:text-rose-300"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className="relative rounded-xl border border-line-soft bg-elevated/60 p-2.5 text-fog transition hover:border-sky/30 hover:text-sky"
            aria-label="Notificações"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-baby animate-pulse-soft" />
          </button>
        </div>

        <div className="flex flex-1 justify-end">
          <SearchBar />
        </div>
      </header>

      <AvatarEditorModal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        currentName={displayName}
        currentAvatarUrl={avatarUrl}
        onSaved={refreshProfile}
      />
    </>
  )
}
