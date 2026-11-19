import { motion } from 'framer-motion'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../../components/financeiro/PageHeader'
import { StateBlock } from '../../components/financeiro/StateBlock'
import { useAuth } from '../../context/AuthContext'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatCurrency } from '../../lib/format'
import {
  createAccount,
  listAccounts,
  listCategories,
  updateProfile,
  type Account,
} from '../../services/financeApi'

const tabs = [
  { id: 'contas', label: 'Contas' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'preferencias', label: 'Preferências' },
] as const

type TabId = (typeof tabs)[number]['id']

async function loadSettings() {
  const [accounts, categories] = await Promise.all([listAccounts(), listCategories()])
  return { accounts, categories }
}

export function ConfiguracoesPage() {
  const { profile, refreshProfile } = useAuth()
  const { data, error, loading, reload } = useAsyncData(loadSettings, [])
  const [tab, setTab] = useState<TabId>('contas')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'checking' as Account['type'],
    balance: '0',
    color: '#7eb8ff',
  })
  const [prefs, setPrefs] = useState({
    currency: profile?.currency ?? 'BRL',
    week_starts_on: String(profile?.week_starts_on ?? 1),
    notify_budgets: profile?.notify_budgets ?? true,
    notify_invoices: profile?.notify_invoices ?? true,
  })

  useEffect(() => {
    if (!profile) return
    setPrefs({
      currency: profile.currency,
      week_starts_on: String(profile.week_starts_on),
      notify_budgets: profile.notify_budgets,
      notify_invoices: profile.notify_invoices,
    })
  }, [profile])

  const expenseCategories = useMemo(
    () => (data?.categories ?? []).filter((category) => category.type === 'expense'),
    [data],
  )
  const incomeCategories = useMemo(
    () => (data?.categories ?? []).filter((category) => category.type === 'income'),
    [data],
  )

  const onCreateAccount = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await createAccount({
        name: accountForm.name.trim(),
        type: accountForm.type,
        balance: Number(accountForm.balance || 0),
        color: accountForm.color,
      })
      setAccountForm({ name: '', type: 'checking', balance: '0', color: '#7eb8ff' })
      setMessage('Conta criada com sucesso.')
      await reload()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setSaving(false)
    }
  }

  const onSavePrefs = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await updateProfile({
        currency: prefs.currency,
        week_starts_on: Number(prefs.week_starts_on),
        notify_budgets: prefs.notify_budgets,
        notify_invoices: prefs.notify_invoices,
      })
      await refreshProfile()
      setMessage('Preferências atualizadas.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erro ao salvar preferências')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Configurações"
        description="Contas, categorias e preferências sincronizadas com o Supabase."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
              tab === item.id ? 'bg-sky/20 text-baby' : 'bg-elevated/60 text-fog hover:text-cloud'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <StateBlock loading={loading} error={error} />
      {message && (
        <p className="mb-4 rounded-xl border border-sky/20 bg-sky/10 px-3 py-2 text-sm text-baby">
          {message}
        </p>
      )}

      {!loading && !error && data && tab === 'contas' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form
            onSubmit={onCreateAccount}
            className="mb-4 grid gap-2 rounded-2xl border border-line-soft bg-elevated/40 p-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <input
              required
              value={accountForm.name}
              onChange={(event) => setAccountForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Nome da conta"
              className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
            />
            <select
              value={accountForm.type}
              onChange={(event) =>
                setAccountForm((prev) => ({
                  ...prev,
                  type: event.target.value as Account['type'],
                }))
              }
              className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
            >
              <option value="checking">Conta corrente</option>
              <option value="savings">Poupança</option>
              <option value="cash">Carteira</option>
              <option value="investment">Investimento</option>
            </select>
            <input
              type="number"
              step="0.01"
              value={accountForm.balance}
              onChange={(event) =>
                setAccountForm((prev) => ({ ...prev, balance: event.target.value }))
              }
              placeholder="Saldo inicial"
              className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
            />
            <button
              type="submit"
              disabled={saving}
              className="h-10 rounded-xl bg-sky/20 text-sm font-medium text-baby disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Adicionar conta'}
            </button>
          </form>

          {data.accounts.length === 0 ? (
            <StateBlock
              empty
              emptyTitle="Nenhuma conta"
              emptyDescription="Crie sua primeira conta para começar a lançar transações."
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {data.accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between rounded-2xl border border-line-soft bg-elevated/45 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-snow">{account.name}</p>
                      <p className="text-xs capitalize text-fog">{account.type}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-cloud">
                    {formatCurrency(Number(account.balance))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!loading && !error && data && tab === 'categorias' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-2"
        >
          <CategoryGroup title="Receitas" items={incomeCategories} />
          <CategoryGroup title="Despesas" items={expenseCategories} />
        </motion.div>
      )}

      {tab === 'preferencias' && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={onSavePrefs}
          className="max-w-xl space-y-4 rounded-2xl border border-line-soft bg-elevated/40 p-5"
        >
          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">
              Moeda padrão
            </span>
            <select
              value={prefs.currency}
              onChange={(event) => setPrefs((prev) => ({ ...prev, currency: event.target.value }))}
              className="w-full rounded-xl border border-line-soft bg-panel px-3 py-2.5 text-sm text-snow outline-none focus:border-sky/40"
            >
              <option value="BRL">BRL — Real brasileiro</option>
              <option value="USD">USD — Dólar</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-fog">
              Início da semana
            </span>
            <select
              value={prefs.week_starts_on}
              onChange={(event) =>
                setPrefs((prev) => ({ ...prev, week_starts_on: event.target.value }))
              }
              className="w-full rounded-xl border border-line-soft bg-panel px-3 py-2.5 text-sm text-snow outline-none focus:border-sky/40"
            >
              <option value="1">Segunda-feira</option>
              <option value="0">Domingo</option>
            </select>
          </label>

          <ToggleRow
            title="Alertas de orçamento"
            description="Avisos quando uma categoria se aproximar do limite"
            checked={prefs.notify_budgets}
            onToggle={() =>
              setPrefs((prev) => ({ ...prev, notify_budgets: !prev.notify_budgets }))
            }
          />
          <ToggleRow
            title="Alertas de fatura"
            description="Lembretes de fechamento e vencimento de cartão"
            checked={prefs.notify_invoices}
            onToggle={() =>
              setPrefs((prev) => ({ ...prev, notify_invoices: !prev.notify_invoices }))
            }
          />

          <button
            type="submit"
            disabled={saving}
            className="h-10 w-full rounded-xl bg-sky/90 text-sm font-semibold text-ink transition hover:bg-baby disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar preferências'}
          </button>
        </motion.form>
      )}
    </section>
  )
}

function CategoryGroup({
  title,
  items,
}: {
  title: string
  items: Array<{
    id: string
    name: string
    color: string
    monthly_budget: number | null
  }>
}) {
  return (
    <div className="rounded-2xl border border-line-soft bg-elevated/40 p-5">
      <h2 className="mb-4 font-display text-lg font-semibold text-snow">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-fog">Nenhuma categoria. Crie uma conta/login para gerar o padrão.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded-xl bg-panel/50 px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-sm text-cloud">{category.name}</span>
              </div>
              {category.monthly_budget ? (
                <span className="text-xs text-fog">
                  Orçamento {formatCurrency(Number(category.monthly_budget))}
                </span>
              ) : (
                <span className="text-xs text-fog">Sem limite</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string
  description: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-xl border border-line-soft bg-panel px-3 py-3 text-left"
    >
      <div>
        <p className="text-sm font-medium text-snow">{title}</p>
        <p className="text-xs text-fog">{description}</p>
      </div>
      <span className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-sky' : 'bg-mist'}`}>
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-snow transition ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </span>
    </button>
  )
}
