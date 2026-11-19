/** Cálculo estimativo do 13º salário (CLT) — uso ilustrativo. */

export type ParcelaMode = 'unica' | 'primeira' | 'segunda'

export type DecimoTerceiroInput = {
  salarioBruto: number
  mesesTrabalhados: number
  dependentes: number
  parcela: ParcelaMode
}

export type DecimoTerceiroResult = {
  meses: number
  baseCalculo: number
  brutoProporcional: number
  inss: number
  irrf: number
  totalDescontos: number
  valorParcela: number
  liquidoEstimado: number
  parcelaLabel: string
  detalhe: string
}

const INSS_FAIXAS = [
  { limit: 1518.0, rate: 0.075 },
  { limit: 2793.88, rate: 0.09 },
  { limit: 4190.83, rate: 0.12 },
  { limit: 8157.41, rate: 0.14 },
] as const

const IRRF_FAIXAS = [
  { limit: 2259.2, rate: 0, deduction: 0 },
  { limit: 2826.65, rate: 0.075, deduction: 169.44 },
  { limit: 3751.05, rate: 0.15, deduction: 381.44 },
  { limit: 4664.68, rate: 0.225, deduction: 662.77 },
  { limit: Infinity, rate: 0.275, deduction: 896.0 },
] as const

const DEPENDENTE_DEDUCAO = 189.59

export const PARCELA_OPTIONS: Array<{ value: ParcelaMode; label: string }> = [
  { value: 'unica', label: 'Única' },
  { value: 'primeira', label: '1ª parcela' },
  { value: 'segunda', label: '2ª parcela' },
]

export function clampMeses(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(12, Math.max(0, Math.round(value)))
}

export function calcInss(base: number) {
  if (base <= 0) return 0

  let remaining = Math.min(base, INSS_FAIXAS[INSS_FAIXAS.length - 1].limit)
  let previous = 0
  let total = 0

  for (const faixa of INSS_FAIXAS) {
    if (remaining <= previous) break
    const taxable = Math.min(remaining, faixa.limit) - previous
    total += taxable * faixa.rate
    previous = faixa.limit
  }

  return round2(total)
}

export function calcIrrf(base: number, dependentes: number) {
  const dependents = Math.max(0, Math.floor(dependentes))
  const taxable = Math.max(0, base - dependents * DEPENDENTE_DEDUCAO)
  if (taxable <= 0) return 0

  const faixa = IRRF_FAIXAS.find((item) => taxable <= item.limit) ?? IRRF_FAIXAS[IRRF_FAIXAS.length - 1]
  return round2(Math.max(0, taxable * faixa.rate - faixa.deduction))
}

export function calculateDecimoTerceiro(input: DecimoTerceiroInput): DecimoTerceiroResult {
  const meses = clampMeses(input.mesesTrabalhados)
  const salario = Math.max(0, input.salarioBruto)
  const brutoProporcional = round2((salario / 12) * meses)

  const inss = calcInss(brutoProporcional)
  const irrf = calcIrrf(Math.max(0, brutoProporcional - inss), input.dependentes)
  const totalDescontos = round2(inss + irrf)
  const liquidoTotal = round2(Math.max(0, brutoProporcional - totalDescontos))
  const primeiraParcela = round2(brutoProporcional / 2)
  const segundaParcelaLiquida = round2(Math.max(0, liquidoTotal - primeiraParcela))

  if (input.parcela === 'primeira') {
    return {
      meses,
      baseCalculo: round2(salario),
      brutoProporcional,
      inss: 0,
      irrf: 0,
      totalDescontos: 0,
      valorParcela: primeiraParcela,
      liquidoEstimado: primeiraParcela,
      parcelaLabel: '1ª parcela',
      detalhe: 'Adiantamento de 50% do bruto, sem descontos de INSS/IRRF.',
    }
  }

  if (input.parcela === 'segunda') {
    return {
      meses,
      baseCalculo: round2(salario),
      brutoProporcional,
      inss,
      irrf,
      totalDescontos,
      valorParcela: segundaParcelaLiquida,
      liquidoEstimado: segundaParcelaLiquida,
      parcelaLabel: '2ª parcela',
      detalhe: 'Saldo restante com descontos de INSS e IRRF sobre o 13º total.',
    }
  }

  return {
    meses,
    baseCalculo: round2(salario),
    brutoProporcional,
    inss,
    irrf,
    totalDescontos,
    valorParcela: liquidoTotal,
    liquidoEstimado: liquidoTotal,
    parcelaLabel: 'Parcela única',
    detalhe: 'Pagamento integral do 13º com descontos estimados de INSS e IRRF.',
  }
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}
