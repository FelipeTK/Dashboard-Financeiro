import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, PiggyBank, Wallet } from 'lucide-react'
import { MetricCard } from '../../components/financeiro/MetricCard'
import { PageHeader } from '../../components/financeiro/PageHeader'
import { StateBlock } from '../../components/financeiro/StateBlock'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatCurrency, formatDate } from '../../lib/format'
import { getDashboardSnapshot } from '../../services/financeApi'

export function FinanceiroDashboardPage() {
  const { data, error, loading } = useAsyncData(() => getDashboardSnapshot(), [])

  const recent = (data?.transactions ?? []).slice(0, 5)
  const categoryMap = new Map((data?.categories ?? []).map((item) => [item.id, item]))
  const accountMap = new Map((data?.accounts ?? []).map((item) => [item.id, item]))

  return (
    <section>
      <PageHeader
        title="Dashboard"
        description="Visão geral estilo Mobills: saldo consolidado, fluxo do mês e contas em tempo real."
      />

      <StateBlock loading={loading} error={error} />

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Saldo total"
              value={formatCurrency(data.totals.balance)}
              hint="Todas as contas"
              icon={Wallet}
              tone="accent"
              delay={0.05}
            />
            <MetricCard
              label="Receitas"
              value={formatCurrency(data.totals.income)}
              hint="Lançamentos confirmados/pendentes"
              icon={ArrowUpRight}
              tone="positive"
              delay={0.1}
            />
            <MetricCard
              label="Despesas"
              value={formatCurrency(data.totals.expense)}
              hint="Lançamentos confirmados/pendentes"
              icon={ArrowDownRight}
              tone="negative"
              delay={0.15}
            />
            <MetricCard
              label="Sobra"
              value={formatCurrency(data.totals.leftover)}
              hint="Receitas − despesas"
              icon={PiggyBank}
              tone="neutral"
              delay={0.2}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-line-soft bg-elevated/40 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-snow">Últimas transações</h2>
              </div>

              {recent.length === 0 ? (
                <StateBlock
                  empty
                  emptyTitle="Sem lançamentos"
                  emptyDescription="Crie sua primeira transação em Financeiro → Transações."
                />
              ) : (
                <ul className="space-y-3">
                  {recent.map((tx, index) => {
                    const category = categoryMap.get(tx.category_id)
                    const account = accountMap.get(tx.account_id)
                    return (
                      <motion.li
                        key={tx.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-transparent bg-panel/50 px-3 py-3 transition hover:border-line-soft"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-snow">{tx.description}</p>
                          <p className="truncate text-xs text-fog">
                            {category?.name} · {account?.name} · {formatDate(tx.occurred_on)}
                          </p>
                        </div>
                        <p
                          className={`shrink-0 text-sm font-semibold ${
                            tx.type === 'income' ? 'text-emerald-300' : 'text-rose-300'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'}
                          {formatCurrency(Number(tx.amount))}
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
              <h2 className="mb-4 font-display text-lg font-semibold text-snow">Contas</h2>
              {data.accounts.length === 0 ? (
                <StateBlock
                  empty
                  emptyTitle="Nenhuma conta"
                  emptyDescription="Cadastre contas em Financeiro → Configurações."
                />
              ) : (
                <ul className="space-y-3">
                  {data.accounts.map((account, index) => (
                    <motion.li
                      key={account.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center justify-between rounded-xl bg-panel/50 px-3 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
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
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.div>
          </div>
        </>
      )}
    </section>
  )
}
