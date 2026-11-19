import { motion } from 'framer-motion'
import { Calculator, Info, RefreshCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MetricCard } from '../../components/financeiro/MetricCard'
import { PageHeader } from '../../components/financeiro/PageHeader'
import {
  calculateDecimoTerceiro,
  clampMeses,
  PARCELA_OPTIONS,
  type ParcelaMode,
} from '../../lib/decimoTerceiro'
import { formatCurrency } from '../../lib/format'

const currentYear = new Date().getFullYear()

function parseMoneyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  const amount = Number(digits) / 100
  return Number.isFinite(amount) ? amount : 0
}

function formatMoneyInput(value: number) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function DecimoTerceiroPage() {
  const [salarioCents, setSalarioCents] = useState('0')
  const [dependentes, setDependentes] = useState('')
  const [meses, setMeses] = useState('')
  const [parcela, setParcela] = useState<ParcelaMode>('unica')
  const [touched, setTouched] = useState({ dependentes: false, meses: false })

  const salario = parseMoneyInput(salarioCents)
  const dependentesNum = Number(dependentes)
  const mesesNum = Number(meses)

  const dependentesInvalid =
    touched.dependentes && (dependentes === '' || !Number.isFinite(dependentesNum) || dependentesNum < 0)
  const mesesInvalid =
    touched.meses &&
    (meses === '' || !Number.isFinite(mesesNum) || mesesNum < 1 || mesesNum > 12)

  const canCalculate =
    salario > 0 &&
    dependentes !== '' &&
    Number.isFinite(dependentesNum) &&
    dependentesNum >= 0 &&
    meses !== '' &&
    Number.isFinite(mesesNum) &&
    mesesNum >= 1 &&
    mesesNum <= 12

  const result = useMemo(() => {
    if (!canCalculate) return null
    return calculateDecimoTerceiro({
      salarioBruto: salario,
      mesesTrabalhados: clampMeses(mesesNum),
      dependentes: dependentesNum,
      parcela,
    })
  }, [canCalculate, salario, mesesNum, dependentesNum, parcela])

  const reset = () => {
    setSalarioCents('0')
    setDependentes('')
    setMeses('')
    setParcela('unica')
    setTouched({ dependentes: false, meses: false })
  }

  return (
    <section>
      <PageHeader
        eyebrow="Calculadora"
        title="Décimo Terceiro"
        description={`Informe salário, dependentes, meses trabalhados e o tipo de parcela para simular o 13º de ${currentYear}.`}
        actions={
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl border border-line-soft bg-elevated/60 px-3.5 py-2.5 text-sm text-fog transition hover:border-sky/30 hover:text-sky"
          >
            <RefreshCcw size={15} />
            Limpar
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-line-soft bg-elevated/40 p-5"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="mb-5 flex items-center gap-2 text-sky">
            <Calculator size={18} />
            <h2 className="font-display text-lg font-semibold text-snow">Dados do cálculo</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm text-cloud">Salário bruto</span>
              <div className="flex h-11 overflow-hidden rounded-xl border border-line-soft bg-panel focus-within:border-sky/40">
                <span className="flex items-center border-r border-line-soft bg-mist/40 px-3 text-sm text-fog">
                  R$
                </span>
                <input
                  value={formatMoneyInput(salario)}
                  onChange={(event) => setSalarioCents(event.target.value.replace(/\D/g, '') || '0')}
                  inputMode="numeric"
                  className="h-full w-full bg-transparent px-3 text-sm text-snow outline-none"
                  placeholder="0,00"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-cloud">
                Número de dependentes <span className="text-rose-400">*</span>
              </span>
              <input
                type="number"
                min={0}
                max={20}
                value={dependentes}
                onChange={(event) => setDependentes(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, dependentes: true }))}
                className={`h-11 w-full rounded-xl border bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40 ${
                  dependentesInvalid ? 'border-rose-400/60' : 'border-line-soft'
                }`}
                placeholder=""
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-cloud">
                Número de meses trabalhados <span className="text-rose-400">*</span>
              </span>
              <input
                type="number"
                min={1}
                max={12}
                value={meses}
                onChange={(event) => setMeses(event.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, meses: true }))}
                className={`h-11 w-full rounded-xl border bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40 ${
                  mesesInvalid ? 'border-rose-400/60' : 'border-line-soft'
                }`}
                placeholder=""
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm text-cloud">Parcela</span>
              <select
                value={parcela}
                onChange={(event) => setParcela(event.target.value as ParcelaMode)}
                className="h-11 w-full rounded-xl border border-line-soft bg-panel px-3 text-sm text-snow outline-none focus:border-sky/40"
              >
                {PARCELA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </motion.form>

        <div className="space-y-4">
          {!result ? (
            <div className="rounded-2xl border border-dashed border-line bg-elevated/30 px-4 py-10 text-center text-sm text-fog">
              Preencha salário, dependentes e meses trabalhados para ver o resultado.
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <MetricCard
                  label="13º bruto"
                  value={formatCurrency(result.brutoProporcional)}
                  hint={`${result.meses} meses · base ${formatCurrency(result.baseCalculo)}`}
                  icon={Calculator}
                  tone="accent"
                />
                <MetricCard
                  label={result.parcelaLabel}
                  value={formatCurrency(result.valorParcela)}
                  hint={result.detalhe}
                  icon={Calculator}
                  tone="positive"
                  delay={0.05}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-line-soft bg-elevated/40 p-5"
              >
                <h3 className="font-display text-lg font-semibold text-snow">Detalhamento</h3>
                <ul className="mt-4 space-y-3">
                  <ResultRow label="Bruto proporcional" value={formatCurrency(result.brutoProporcional)} />
                  <ResultRow
                    label="INSS estimado"
                    value={formatCurrency(result.inss)}
                    tone="negative"
                  />
                  <ResultRow
                    label="IRRF estimado"
                    value={formatCurrency(result.irrf)}
                    tone="negative"
                  />
                  <ResultRow
                    label="Total de descontos"
                    value={formatCurrency(result.totalDescontos)}
                    tone="negative"
                  />
                  <ResultRow
                    label="Valor da parcela"
                    value={formatCurrency(result.valorParcela)}
                    tone="positive"
                    strong
                  />
                </ul>
              </motion.div>
            </>
          )}

          <div className="flex gap-3 rounded-2xl border border-sky/20 bg-sky/10 px-4 py-3 text-sm text-cloud">
            <Info size={16} className="mt-0.5 shrink-0 text-sky" />
            <p>
              Estimativa educacional. A 1ª parcela normalmente não tem desconto; INSS e IRRF
              concentram-se na 2ª parcela ou no pagamento único.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ResultRow({
  label,
  value,
  tone = 'neutral',
  strong = false,
}: {
  label: string
  value: string
  tone?: 'neutral' | 'positive' | 'negative'
  strong?: boolean
}) {
  const valueClass =
    tone === 'positive'
      ? 'text-emerald-300'
      : tone === 'negative'
        ? 'text-rose-300'
        : 'text-snow'

  return (
    <li className="flex items-start justify-between gap-3 rounded-xl bg-panel/50 px-3 py-3">
      <p className={`text-sm ${strong ? 'font-semibold text-snow' : 'text-cloud'}`}>{label}</p>
      <p className={`shrink-0 text-sm font-semibold ${valueClass}`}>{value}</p>
    </li>
  )
}
