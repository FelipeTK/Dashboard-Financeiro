import { AnimatePresence, motion } from 'framer-motion'
import { Filter, Plus, Search } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../../components/financeiro/PageHeader'
import { StateBlock } from '../../components/financeiro/StateBlock'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../../lib/format'
import {
  createTransaction,
  listAccounts,
  listCategories,
  listTransactions,
} from '../../services/financeApi'
import type { MoneyFlow as Flow } from '../../types/database'

const filters: Array<{ id: 'all' | Flow; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'income', label: 'Receitas' },
  { id: 'expense', label: 'Despesas' },
]

async function loadTransactionsBundle() {
  const [transactions, accounts, categories] = await Promise.all([
    listTransactions(),
    listAccounts(),
    listCategories(),
  ])
  return { transactions, accounts, categories }
}

export function TransacoesPage() {
  const { data, error, loading, reload } = useAsyncData(loadTransactionsBundle, [])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | Flow>('all')
  const [openForm, setOpenForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'expense' as Flow,
    account_id: '',
    category_id: '',
    occurred_on: new Date().toISOString().slice(0, 10),
  })

  const filtered = useMemo(() => {
    const transactions = data?.transactions ?? []
    const categories = data?.categories ?? []
    const accounts = data?.accounts ?? []

    return transactions
      .filter((tx) => (filter === 'all' ? true : tx.type === filter))
      .filter((tx) => {
        const category = categories.find((item) => item.id === tx.category_id)?.name ?? ''
        const account = accounts.find((item) => item.id === tx.account_id)?.name ?? ''
        const haystack = `${tx.description} ${category} ${account}`.toLowerCase()
        return haystack.includes(query.trim().toLowerCase())
      })
  }, [data, filter, query])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += Number(tx.amount)
        else acc.expense += Number(tx.amount)
        return acc
      },
      { income: 0, expense: 0 },
    )
  }, [filtered])

  const categoriesForType = (data?.categories ?? []).filter((item) => item.type === form.type)

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      await createTransaction({
        description: form.description.trim(),
        amount: Number(form.amount),
        type: form.type,
        account_id: form.account_id,
        category_id: form.category_id,
        occurred_on: form.occurred_on,
      })
      setOpenForm(false)
      setForm((prev) => ({ ...prev, description: '', amount: '' }))
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Transações"
        description="Lance, filtre e acompanhe receitas e despesas com dados reais do Supabase."
        actions={
          <button
            type="button"
            onClick={() => setOpenForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky/15 px-3.5 py-2.5 text-sm font-medium text-baby transition hover:bg-sky/25"
          >
            <Plus size={16} />
            Novo lançamento
          </button>
        }
      />

      <StateBlock loading={loading} error={error} />

      {!loading && !error && data && (
        <>
          {openForm && (
            <form
              onSubmit={onCreate}
              className="mb-5 grid gap-3 rounded-2xl border border-line-soft bg-elevated/40 p-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              <input
                required
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Descrição"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
                placeholder="Valor"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <select
                value={form.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    type: event.target.value as Flow,
                    category_id: '',
                  }))
                }
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
              <select
                required
                value={form.account_id}
                onChange={(event) => setForm((prev) => ({ ...prev, account_id: event.target.value }))}
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              >
                <option value="">Conta</option>
                {data.accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
              <select
                required
                value={form.category_id}
                onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              >
                <option value="">Categoria</option>
                {categoriesForType.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                required
                value={form.occurred_on}
                onChange={(event) => setForm((prev) => ({ ...prev, occurred_on: event.target.value }))}
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              {formError && (
                <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-300">{formError}</p>
              )}
              {data.accounts.length === 0 && (
                <p className="sm:col-span-2 lg:col-span-3 text-sm text-amber-200">
                  Cadastre uma conta em Configurações antes de lançar.
                </p>
              )}
              <button
                type="submit"
                disabled={saving || data.accounts.length === 0}
                className="h-10 rounded-xl bg-sky/90 text-sm font-semibold text-ink transition hover:bg-baby disabled:opacity-50 sm:col-span-2 lg:col-span-3"
              >
                {saving ? 'Salvando...' : 'Salvar lançamento'}
              </button>
            </form>
          )}

          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-xl px-3.5 py-2 text-sm font-medium transition ${
                    filter === item.id
                      ? 'bg-sky/20 text-baby'
                      : 'bg-elevated/60 text-fog hover:text-cloud'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-line-soft bg-elevated/60 px-3">
              <Search size={15} className="text-fog" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar lançamento, categoria ou conta..."
                className="h-10 w-full min-w-0 bg-transparent text-sm text-snow outline-none placeholder:text-fog/70 sm:w-72"
              />
              <Filter size={15} className="text-fog" />
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line-soft bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              Receitas filtradas: <strong>{formatCurrency(totals.income)}</strong>
            </div>
            <div className="rounded-xl border border-line-soft bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              Despesas filtradas: <strong>{formatCurrency(totals.expense)}</strong>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-line-soft bg-elevated/40">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <StateBlock
                  empty
                  emptyTitle="Nenhuma transação"
                  emptyDescription="Crie um lançamento para começar a acompanhar seu fluxo."
                />
              ) : (
                filtered.map((tx, index) => {
                  const category = data.categories.find((item) => item.id === tx.category_id)
                  const account = data.accounts.find((item) => item.id === tx.account_id)
                  return (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ delay: Math.min(index * 0.03, 0.2) }}
                      className="grid gap-2 border-b border-line-soft/70 px-4 py-3 last:border-b-0 md:grid-cols-[1.4fr_1fr_1fr_0.8fr_0.9fr] md:items-center md:gap-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-snow">{tx.description}</p>
                        <p className="text-xs capitalize text-fog md:hidden">
                          {category?.name} · {formatDate(tx.occurred_on)}
                        </p>
                      </div>
                      <p className="hidden text-sm text-cloud md:block">{category?.name}</p>
                      <p className="hidden text-sm text-cloud md:block">{account?.name}</p>
                      <p className="hidden text-sm text-fog md:block">{formatDate(tx.occurred_on)}</p>
                      <div className="flex items-center justify-between md:justify-end">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            tx.status === 'pending'
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-sky/15 text-baby'
                          }`}
                        >
                          {tx.status === 'pending' ? 'Pendente' : 'Confirmado'}
                        </span>
                        <p
                          className={`text-sm font-semibold md:ml-3 ${
                            tx.type === 'income' ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(tx.amount))}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </section>
  )
}
