import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthPage() {
  const { signIn, signUp, user, loading, configured } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setPending(true)

    const result =
      mode === 'login'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, fullName.trim() || email.split('@')[0])

    setPending(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (mode === 'signup') {
      setSuccess('Conta criada. Se a confirmação de e-mail estiver ativa, verifique sua caixa de entrada.')
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink px-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sky/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-96 w-96 rounded-full bg-cobalt/25 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md rounded-3xl border border-line-soft bg-surface/90 p-6 shadow-2xl shadow-void/40 backdrop-blur-xl sm:p-8"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky">
          Dashboard Financeiro
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-snow">
          {mode === 'login' ? 'Entrar' : 'Criar conta'}
        </h1>
        <p className="mt-2 text-sm text-fog">
          Autenticação via Supabase — seus dados ficam isolados por usuário (RLS).
        </p>

        {!configured && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
            Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no arquivo `.env`.
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          {mode === 'signup' && (
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">Nome</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-11 w-full rounded-xl border border-line-soft bg-elevated/70 px-3 text-sm text-snow outline-none focus:border-sky/40"
                placeholder="Seu nome"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-xl border border-line-soft bg-elevated/70 px-3 text-sm text-snow outline-none focus:border-sky/40"
              placeholder="voce@email.com"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-xl border border-line-soft bg-elevated/70 px-3 text-sm text-snow outline-none focus:border-sky/40"
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !configured}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-sky/90 text-sm font-semibold text-ink transition hover:bg-baby disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode((prev) => (prev === 'login' ? 'signup' : 'login'))
            setError(null)
            setSuccess(null)
          }}
          className="mt-4 w-full text-center text-sm text-fog transition hover:text-sky"
        >
          {mode === 'login' ? 'Não tem conta? Criar agora' : 'Já tem conta? Entrar'}
        </button>
      </motion.div>
    </div>
  )
}
