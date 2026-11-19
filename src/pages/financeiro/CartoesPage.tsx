import { motion } from 'framer-motion'
import { CreditCard, Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { PageHeader } from '../../components/financeiro/PageHeader'
import { ProgressBar } from '../../components/financeiro/ProgressBar'
import { StateBlock } from '../../components/financeiro/StateBlock'
import { useAsyncData } from '../../hooks/useAsyncData'
import { formatCurrency } from '../../lib/format'
import {
  createCreditCard,
  listCreditCards,
  listCreditCardUsage,
  type CreditCard as Card,
} from '../../services/financeApi'

async function loadCards() {
  const [cards, usage] = await Promise.all([listCreditCards(), listCreditCardUsage()])
  return { cards, usage }
}

export function CartoesPage() {
  const { data, error, loading, reload } = useAsyncData(loadCards, [])
  const [openForm, setOpenForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    brand: 'Mastercard' as Card['brand'],
    credit_limit: '',
    closing_day: '8',
    due_day: '15',
    color: '#820ad1',
  })

  const totalUsed = (data?.usage ?? []).reduce((sum, card) => sum + Number(card.used_amount), 0)
  const totalLimit = (data?.cards ?? []).reduce((sum, card) => sum + Number(card.credit_limit), 0)

  const onCreate = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await createCreditCard({
        name: form.name.trim(),
        brand: form.brand,
        credit_limit: Number(form.credit_limit),
        closing_day: Number(form.closing_day),
        due_day: Number(form.due_day),
        color: form.color,
      })
      setOpenForm(false)
      setForm((prev) => ({ ...prev, name: '', credit_limit: '' }))
      await reload()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao salvar cartão')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section>
      <PageHeader
        title="Cartões de crédito"
        description="Controle faturas, limites e disponibilidade com dados reais do Supabase."
        actions={
          <button
            type="button"
            onClick={() => setOpenForm((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl border border-sky/30 bg-sky/15 px-3.5 py-2.5 text-sm font-medium text-baby transition hover:bg-sky/25"
          >
            <Plus size={16} />
            Adicionar cartão
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
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Nome do cartão"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <select
                value={form.brand}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, brand: event.target.value as Card['brand'] }))
                }
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              >
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Elo">Elo</option>
                <option value="Amex">Amex</option>
                <option value="Hipercard">Hipercard</option>
                <option value="Other">Other</option>
              </select>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.credit_limit}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, credit_limit: event.target.value }))
                }
                placeholder="Limite"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <input
                required
                type="number"
                min="1"
                max="31"
                value={form.closing_day}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, closing_day: event.target.value }))
                }
                placeholder="Dia de fechamento"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <input
                required
                type="number"
                min="1"
                max="31"
                value={form.due_day}
                onChange={(event) => setForm((prev) => ({ ...prev, due_day: event.target.value }))}
                placeholder="Dia de vencimento"
                className="h-10 rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              />
              <input
                type="color"
                value={form.color}
                onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
                className="h-10 rounded-xl border border-line-soft bg-panel px-2"
              />
              {formError && (
                <p className="sm:col-span-2 lg:col-span-3 text-sm text-rose-300">{formError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="h-10 rounded-xl bg-sky/90 text-sm font-semibold text-ink transition hover:bg-baby disabled:opacity-50 sm:col-span-2 lg:col-span-3"
              >
                {saving ? 'Salvando...' : 'Salvar cartão'}
              </button>
            </form>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line-soft bg-elevated/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-fog">Uso no mês</p>
              <p className="mt-2 font-display text-2xl font-bold text-snow">
                {formatCurrency(totalUsed)}
              </p>
            </div>
            <div className="rounded-2xl border border-line-soft bg-elevated/50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-fog">Limite total</p>
              <p className="mt-2 font-display text-2xl font-bold text-snow">
                {formatCurrency(totalLimit)}
              </p>
            </div>
          </div>

          {data.cards.length === 0 ? (
            <StateBlock
              empty
              emptyTitle="Nenhum cartão"
              emptyDescription="Adicione um cartão para acompanhar limite e fatura."
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {data.cards.map((card, index) => {
                const usage = data.usage.find((item) => item.id === card.id)
                const used = Number(usage?.used_amount ?? 0)
                const available = Number(usage?.available_amount ?? card.credit_limit)
                const percent = Math.min(
                  100,
                  Math.round((used / Math.max(Number(card.credit_limit), 1)) * 100),
                )
                return (
                  <motion.article
                    key={card.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index }}
                    whileHover={{ y: -4 }}
                    className="overflow-hidden rounded-2xl border border-line-soft bg-elevated/45"
                  >
                    <div
                      className="relative h-36 p-5 text-snow"
                      style={{
                        background: `linear-gradient(135deg, ${card.color} 0%, #0c1220 78%)`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/70">
                            {card.brand}
                          </p>
                          <h2 className="mt-2 font-display text-xl font-bold">{card.name}</h2>
                        </div>
                        <CreditCard size={22} className="text-white/80" />
                      </div>
                      <p className="absolute bottom-5 left-5 text-sm text-white/80">
                        Fecha dia {card.closing_day} · Vence dia {card.due_day}
                      </p>
                    </div>

                    <div className="space-y-4 p-5">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-fog">Utilizado no mês</p>
                          <p className="text-lg font-semibold text-snow">{formatCurrency(used)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-fog">Disponível</p>
                          <p className="text-sm font-medium text-baby">
                            {formatCurrency(available)}
                          </p>
                        </div>
                      </div>

                      <ProgressBar
                        value={percent}
                        tone={percent > 80 ? 'rose' : percent > 55 ? 'amber' : 'sky'}
                      />

                      <p className="text-xs text-fog">
                        {percent}% do limite de {formatCurrency(Number(card.credit_limit))}
                      </p>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}
