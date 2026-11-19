import { supabase } from '../lib/supabase'
import { monthStart } from '../lib/format'
import type { Tables } from '../types/database'

export type Account = Tables<'accounts'>
export type Category = Tables<'categories'>
export type Transaction = Tables<'transactions'>
export type CreditCard = Tables<'credit_cards'>
export type Budget = Tables<'budgets'>
export type Goal = Tables<'goals'>
export type Profile = Tables<'profiles'>

export type CreditCardUsage = {
  id: string
  user_id: string
  name: string
  brand: CreditCard['brand']
  credit_limit: number
  color: string
  used_amount: number
  available_amount: number
}

async function requireUserId() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Faça login para continuar')
  return data.user.id
}

export async function listAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('is_archived', false)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_archived', false)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('occurred_on', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function listCreditCards() {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('is_archived', false)
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function listCreditCardUsage() {
  const { data, error } = await supabase.from('v_credit_card_usage').select('*')
  if (error) throw error
  return (data ?? []) as CreditCardUsage[]
}

export async function listBudgets() {
  const { data, error } = await supabase.from('budgets').select('*').order('month', {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function listGoals() {
  const { data, error } = await supabase.from('goals').select('*').order('created_at', {
    ascending: false,
  })
  if (error) throw error
  return data ?? []
}

export async function getDashboardSnapshot() {
  const [accounts, transactions, categories, cardsUsage, budgets, goals] = await Promise.all([
    listAccounts(),
    listTransactions(),
    listCategories(),
    listCreditCardUsage(),
    listBudgets(),
    listGoals(),
  ])

  const income = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
  const expense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
  const balance = accounts.reduce((sum, account) => sum + Number(account.balance), 0)

  return {
    accounts,
    transactions,
    categories,
    cardsUsage,
    budgets,
    goals,
    totals: {
      balance,
      income,
      expense,
      leftover: income - expense,
    },
  }
}

export async function createAccount(input: {
  name: string
  type: Account['type']
  balance?: number
  color?: string
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('accounts')
    .insert({
      user_id: userId,
      name: input.name,
      type: input.type,
      balance: input.balance ?? 0,
      color: input.color ?? '#7eb8ff',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function createTransaction(input: {
  account_id: string
  category_id: string
  description: string
  amount: number
  type: Transaction['type']
  status?: Transaction['status']
  occurred_on?: string
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      account_id: input.account_id,
      category_id: input.category_id,
      description: input.description,
      amount: input.amount,
      type: input.type,
      status: input.status ?? 'cleared',
      occurred_on: input.occurred_on,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function createCreditCard(input: {
  name: string
  brand: CreditCard['brand']
  credit_limit: number
  closing_day: number
  due_day: number
  color?: string
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('credit_cards')
    .insert({
      user_id: userId,
      name: input.name,
      brand: input.brand,
      credit_limit: input.credit_limit,
      closing_day: input.closing_day,
      due_day: input.due_day,
      color: input.color ?? '#820ad1',
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function createGoal(input: {
  name: string
  target_amount: number
  current_amount?: number
  deadline?: string | null
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: input.name,
      target_amount: input.target_amount,
      current_amount: input.current_amount ?? 0,
      deadline: input.deadline ?? null,
    })
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function upsertBudget(input: {
  category_id: string
  amount_limit: number
  month?: string
}) {
  const userId = await requireUserId()
  const month = input.month ?? monthStart()
  const { data, error } = await supabase
    .from('budgets')
    .upsert(
      {
        user_id: userId,
        category_id: input.category_id,
        month,
        amount_limit: input.amount_limit,
      },
      { onConflict: 'user_id,category_id,month' },
    )
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(input: {
  full_name?: string | null
  avatar_url?: string | null
  currency?: string
  week_starts_on?: number
  notify_budgets?: boolean
  notify_invoices?: boolean
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

export function spentByCategory(transactions: Transaction[], categoryId: string) {
  return transactions
    .filter((tx) => tx.category_id === categoryId && tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
}
