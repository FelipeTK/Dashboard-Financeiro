import { Home, Wallet, type LucideIcon } from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  keywords: string[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    path: '/',
    icon: Home,
    keywords: ['inicio', 'home', 'dashboard', 'bem vindo'],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    path: '/financeiro',
    icon: Wallet,
    keywords: ['financeiro', 'finanças', 'caixa', 'dinheiro', 'contas'],
  },
]

export function searchNavItems(query: string): NavItem[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return NAV_ITEMS

  return NAV_ITEMS.filter((item) => {
    const haystack = [item.label, ...item.keywords].join(' ').toLowerCase()
    return haystack.includes(normalized)
  })
}
