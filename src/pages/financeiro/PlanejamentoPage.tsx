import { motion } from 'framer-motion'
import { Plus, Target } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { PageHeader } from '../../components/financeiro/PageHeader'
import { ProgressBar } from '../../components/financeiro/ProgressBar'
import { StateBlock } from '../../components/financeiro/StateBlock'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatCurrency, formatDate, monthStart } from '../../lib/format'
import {
  createGoal,
  listBudgets,
  listCategories,
  listGoals,
  listTransactions,
  spentByCategory,
  upsertBudget,
} from '../../services/financeApi'

async function loadPlanning() {
  const [budgets, goals, categories, transactions] = await Promise.all([
    listBudgets(),
    listGoals(),
    listCategories(),
    listTransactions(),
  ])
  return { budgets, goals, categories, transactions }
}

export function PlanejamentoPage() {
  const { data, error, loading, reload } = useAsyncData(loadPlanning, [])
  const [savingGoal, setSavingGoal] = useState(false)
  const [goalForm, setGoalForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '0',
    deadline: '',
  })
  const [budgetForm, setBudgetForm] = useState({
    category_id: '',
    amount_limit: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const monthBudgets = useMemo(() => {
    const currentMonth = monthStart()
    return (data?.budgets ?? []).filter((budget) => budget.month.startsWith(currentMonth.slice(0, 7)))
  }, [data])

  const expenseCategories = (data?.categories ?? []).filter((item) => item.type === 'expense')

  const onCreateGoal = async (event: FormEvent) => {
    event.preventDefault()
    setSavingGoal(true)
    setFormError(null)
    try {
      await createGoal({
        name: goalForm.name.trim(),
        target_amount: Number(goalForm.target_amount),
        current_amount: Number(goalForm.current_amount || 0),
        deadline: goalForm.deadline || null,
      })
      setGoalForm({ name: '', target_amount: '', current_amount: '0', deadline: '' })
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar meta')
    } finally {
      setSavingGoal(false)
    }
  }

  const onUpsertBudget = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    try {
      await upsertBudget({
        category_id: budgetForm.category_id,
        amount_limit: Number(budgetForm.amount_limit),
      })
      setBudgetForm({ category_id: '', amount_limit: '' })
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar orçamento')
    }
  }

  return (
    <section>
      <PageHeader
        title="Planejamento"
        description="Orçamentos por categoria e metas financeiras dinâmicas com dados do Supabase."
      />

      <StateBlock loading={loading} error={error} />

      {!loading && !error && data && (
        <div className="grid gap-6 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-line-soft bg-elevated/40 p-5"
          >
            <h2 className="mb-4 font-display text-lg font-semibold text-snow">Orçamentos do mês</h2>

            <form onSubmit={onUpsertBudget} className="mb-4 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
              <select
                required
                value={budgetForm.category_id}
                onChange={(event) =>
                  setBudgetForm((prev) => ({ ...prev, category_id: event.target.value }))
                }
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
              >
                <option value="">Categoria</option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={budgetForm.amount_limit}
                onChange={(event) =>
                  setBudgetForm((prev) => ({ ...prev, amount_limit: event.target.value }))
                }
                placeholder="Limite"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-sky/20 px-3 text-sm font-medium text-baby"
              >
                <Plus size={14} />
                Salvar
              </button>
            </form>

            {monthBudgets.length === 0 ? (
              <StateBlock
                empty
                emptyTitle="Sem orçamentos"
                emptyDescription="Defina um limite mensal por categoria para acompanhar o gasto."
              />
            ) : (
              <ul className="space-y-4">
                {monthBudgets.map((budget, index) => {
                  const category = data.categories.find((item) => item.id === budget.category_id)
                  const spent = spentByCategory(data.transactions, budget.category_id)
                  const percent = Math.min(
                    100,
                    Math.round((spent / Math.max(Number(budget.amount_limit), 1)) * 100),
                  )
                  const remaining = Math.max(0, Number(budget.amount_limit) - spent)
                  const over = spent > Number(budget.amount_limit)
                  return (
                    <motion.li
                      key={budget.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.04 * index }}
                      className="rounded-xl bg-panel/50 p-3.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: category?.color }}
                          />
                          <p className="text-sm font-medium text-snow">{category?.name}</p>
                        </div>
                        <p className="text-xs text-fog">
                          {formatCurrency(spent)} / {formatCurrency(Number(budget.amount_limit))}
                        </p>
                      </div>
                      <ProgressBar
                        value={percent}
                        tone={over ? 'rose' : percent > 75 ? 'amber' : 'emerald'}
                      />
                      <p className="mt-2 text-xs text-fog">
                        {over ? 'Orçamento estourado' : `Restam ${formatCurrency(remaining)}`}
                      </p>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-line-soft bg-elevated/40 p-5"
          >
            <h2 className="mb-4 font-display text-lg font-semibold text-snow">Metas</h2>

            <form onSubmit={onCreateGoal} className="mb-4 grid gap-2 sm:grid-cols-2">
              <input
                required
                value={goalForm.name}
                onChange={(event) => setGoalForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nome da meta"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none sm:col-span-2"
              />
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={goalForm.target_amount}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, target_amount: event.target.value }))
                }
                placeholder="Valor alvo"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={goalForm.current_amount}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, current_amount: event.target.value }))
                }
                placeholder="Valor atual"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none"
              />
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(event) =>
                  setGoalForm((prev) => ({ ...prev, deadline: event.target.value }))
                }
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none sm:col-span-2"
              />
              <button
                type="submit"
                disabled={savingGoal}
                className="h-10 rounded-xl bg-sky/20 text-sm font-medium text-baby sm:col-span-2"
              >
                {savingGoal ? 'Salvando...' : 'Criar meta'}
              </button>
            </form>

            {formError && <p className="mb-3 text-sm text-rose-300">{formError}</p>}

            {data.goals.length === 0 ? (
              <StateBlock
                empty
                emptyTitle="Sem metas"
                emptyDescription="Crie uma meta para acompanhar sua evolução financeira."
              />
            ) : (
              <ul className="space-y-4">
                {data.goals.map((goal, index) => {
                  const percent = Math.min(
                    100,
                    Math.round(
                      (Number(goal.current_amount) / Math.max(Number(goal.target_amount), 1)) * 100,
                    ),
                  )
                  return (
                    <motion.li
                      key={goal.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="rounded-xl border border-line-soft/80 bg-panel/40 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky/15 text-baby">
                            <Target size={16} />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-snow">{goal.name}</p>
                            <p className="text-xs text-fog">
                              {goal.deadline ? `Até ${formatDate(goal.deadline)}` : 'Sem prazo'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-baby">{percent}%</p>
                      </div>
                      <ProgressBar value={percent} tone="sky" />
                      <div className="mt-2 flex justify-between text-xs text-fog">
                        <span>{formatCurrency(Number(goal.current_amount))}</span>
                        <span>Meta {formatCurrency(Number(goal.target_amount))}</span>
                      </div>
                    </motion.li>
                  )
                })}
              </ul>
            )}
          </motion.div>
        </div>
      )}
    </section>
  )
}
