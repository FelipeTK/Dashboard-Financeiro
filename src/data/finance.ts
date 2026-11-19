export type MoneyFlow = 'income' | 'expense'

export type Account = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'cash' | 'investment'
  balance: number
  color: string
}

export type Category = {
  id: string
  name: string
  type: MoneyFlow
  icon: string
  color: string
  budget?: number
}

export type Transaction = {
  id: string
  description: string
  amount: number
  type: MoneyFlow
  date: string
  accountId: string
  categoryId: string
  status: 'cleared' | 'pending'
}

export type CreditCard = {
  id: string
  name: string
  brand: 'Visa' | 'Mastercard' | 'Elo' | 'Amex'
  limit: number
  used: number
  closingDay: number
  dueDay: number
  color: string
}

export type Budget = {
  id: string
  categoryId: string
  limit: number
  spent: number
}

export type Goal = {
  id: string
  name: string
  target: number
  current: number
  deadline: string
}

export const accounts: Account[] = [
  { id: 'acc-nubank', name: 'Nubank', type: 'checking', balance: 4820.45, color: '#820ad1' },
  { id: 'acc-itau', name: 'Itaú Conta', type: 'checking', balance: 2150.0, color: '#ec7000' },
  { id: 'acc-caixa', name: 'Caixinha', type: 'savings', balance: 8900.0, color: '#7eb8ff' },
  { id: 'acc-carteira', name: 'Carteira', type: 'cash', balance: 180.5, color: '#5a6a84' },
]

export const categories: Category[] = [
  { id: 'cat-salary', name: 'Salário', type: 'income', icon: 'Briefcase', color: '#4ade80', budget: 0 },
  { id: 'cat-freelance', name: 'Freelance', type: 'income', icon: 'Laptop', color: '#34d399' },
  { id: 'cat-food', name: 'Alimentação', type: 'expense', icon: 'Utensils', color: '#fb7185', budget: 1200 },
  { id: 'cat-home', name: 'Moradia', type: 'expense', icon: 'Home', color: '#60a5fa', budget: 2500 },
  { id: 'cat-transport', name: 'Transporte', type: 'expense', icon: 'Car', color: '#fbbf24', budget: 600 },
  { id: 'cat-leisure', name: 'Lazer', type: 'expense', icon: 'Sparkles', color: '#a78bfa', budget: 400 },
  { id: 'cat-health', name: 'Saúde', type: 'expense', icon: 'HeartPulse', color: '#f472b6', budget: 350 },
  { id: 'cat-subscriptions', name: 'Assinaturas', type: 'expense', icon: 'Repeat', color: '#38bdf8', budget: 180 },
]

export const transactions: Transaction[] = [
  {
    id: 'tx-1',
    description: 'Salário mensal',
    amount: 8500,
    type: 'income',
    date: '2026-11-05',
    accountId: 'acc-nubank',
    categoryId: 'cat-salary',
    status: 'cleared',
  },
  {
    id: 'tx-2',
    description: 'Aluguel',
    amount: 2200,
    type: 'expense',
    date: '2026-11-08',
    accountId: 'acc-itau',
    categoryId: 'cat-home',
    status: 'cleared',
  },
  {
    id: 'tx-3',
    description: 'Supermercado Extra',
    amount: 346.9,
    type: 'expense',
    date: '2026-11-12',
    accountId: 'acc-nubank',
    categoryId: 'cat-food',
    status: 'cleared',
  },
  {
    id: 'tx-4',
    description: 'Uber',
    amount: 28.4,
    type: 'expense',
    date: '2026-11-14',
    accountId: 'acc-nubank',
    categoryId: 'cat-transport',
    status: 'cleared',
  },
  {
    id: 'tx-5',
    description: 'Projeto landing page',
    amount: 1800,
    type: 'income',
    date: '2026-11-15',
    accountId: 'acc-nubank',
    categoryId: 'cat-freelance',
    status: 'cleared',
  },
  {
    id: 'tx-6',
    description: 'Netflix',
    amount: 55.9,
    type: 'expense',
    date: '2026-11-16',
    accountId: 'acc-nubank',
    categoryId: 'cat-subscriptions',
    status: 'pending',
  },
  {
    id: 'tx-7',
    description: 'Farmácia',
    amount: 89.7,
    type: 'expense',
    date: '2026-11-17',
    accountId: 'acc-carteira',
    categoryId: 'cat-health',
    status: 'cleared',
  },
  {
    id: 'tx-8',
    description: 'Cinema',
    amount: 64,
    type: 'expense',
    date: '2026-11-18',
    accountId: 'acc-nubank',
    categoryId: 'cat-leisure',
    status: 'pending',
  },
]

export const creditCards: CreditCard[] = [
  {
    id: 'card-nubank',
    name: 'Nubank Roxinho',
    brand: 'Mastercard',
    limit: 12000,
    used: 2840.55,
    closingDay: 8,
    dueDay: 15,
    color: '#820ad1',
  },
  {
    id: 'card-inter',
    name: 'Inter Black',
    brand: 'Visa',
    limit: 8000,
    used: 1120.0,
    closingDay: 20,
    dueDay: 27,
    color: '#ff7a00',
  },
  {
    id: 'card-c6',
    name: 'C6 Carbon',
    brand: 'Mastercard',
    limit: 15000,
    used: 430.2,
    closingDay: 3,
    dueDay: 10,
    color: '#1f2937',
  },
]

export const budgets: Budget[] = [
  { id: 'bud-1', categoryId: 'cat-food', limit: 1200, spent: 742.3 },
  { id: 'bud-2', categoryId: 'cat-transport', limit: 600, spent: 318.4 },
  { id: 'bud-3', categoryId: 'cat-leisure', limit: 400, spent: 210 },
  { id: 'bud-4', categoryId: 'cat-subscriptions', limit: 180, spent: 149.8 },
  { id: 'bud-5', categoryId: 'cat-health', limit: 350, spent: 89.7 },
]

export const goals: Goal[] = [
  {
    id: 'goal-1',
    name: 'Reserva de emergência',
    target: 20000,
    current: 8900,
    deadline: '2027-03-01',
  },
  {
    id: 'goal-2',
    name: 'Viagem Europa',
    target: 12000,
    current: 3400,
    deadline: '2027-07-15',
  },
  {
    id: 'goal-3',
    name: 'Novo notebook',
    target: 7000,
    current: 4550,
    deadline: '2026-12-20',
  },
]

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`))
}

export function getAccount(id: string) {
  return accounts.find((account) => account.id === id)
}

export function getCategory(id: string) {
  return categories.find((category) => category.id === id)
}

export function getTotals() {
  const balance = accounts.reduce((sum, account) => sum + account.balance, 0)
  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0)
  const expense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0)

  return {
    balance,
    income,
    expense,
    leftover: income - expense,
  }
}

export function getCardUsage(card: CreditCard) {
  const percent = Math.min(100, Math.round((card.used / card.limit) * 100))
  return {
    percent,
    available: card.limit - card.used,
  }
}

export function getBudgetProgress(budget: Budget) {
  const percent = Math.min(100, Math.round((budget.spent / budget.limit) * 100))
  return {
    percent,
    remaining: Math.max(0, budget.limit - budget.spent),
    over: budget.spent > budget.limit,
  }
}

export function getGoalProgress(goal: Goal) {
  const percent = Math.min(100, Math.round((goal.current / goal.target) * 100))
  return {
    percent,
    remaining: Math.max(0, goal.target - goal.current),
  }
}
