import {
  ArrowLeftRight,
  Calculator,
  CreditCard,
  Gift,
  Home,
  LayoutDashboard,
  Settings,
  Target,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  id: string
  label: string
  path: string
  icon: LucideIcon
  keywords: string[]
  children?: NavItem[]
}

export type FlatNavItem = NavItem & {
  parentLabel?: string
  parentId?: string
}

export const APP_SETTINGS_ITEM: NavItem = {
  id: 'app-configuracoes',
  label: 'Configurações',
  path: '/configuracoes',
  icon: Settings,
  keywords: ['configurações', 'tema', 'claro', 'escuro', 'aparência', 'settings'],
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'inicio',
    label: 'Início',
    path: '/',
    icon: Home,
    keywords: ['inicio', 'home', 'bem vindo'],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    path: '/financeiro',
    icon: Wallet,
    keywords: ['financeiro', 'finanças', 'caixa', 'dinheiro', 'contas', 'mobills'],
    children: [
      {
        id: 'financeiro-dashboard',
        label: 'Dashboard',
        path: '/financeiro/dashboard',
        icon: LayoutDashboard,
        keywords: ['dashboard', 'resumo', 'saldo', 'visão geral', 'painel'],
      },
      {
        id: 'financeiro-transacoes',
        label: 'Transações',
        path: '/financeiro/transacoes',
        icon: ArrowLeftRight,
        keywords: ['transações', 'lançamentos', 'receitas', 'despesas', 'extrato'],
      },
      {
        id: 'financeiro-cartoes',
        label: 'Cartões de crédito',
        path: '/financeiro/cartoes',
        icon: CreditCard,
        keywords: ['cartões', 'crédito', 'fatura', 'limite', 'cartao'],
      },
      {
        id: 'financeiro-planejamento',
        label: 'Planejamento',
        path: '/financeiro/planejamento',
        icon: Target,
        keywords: ['planejamento', 'orçamento', 'metas', 'budget', 'objetivos'],
      },
      {
        id: 'financeiro-configuracoes',
        label: 'Configurações',
        path: '/financeiro/configuracoes',
        icon: Settings,
        keywords: ['configurações', 'categorias', 'contas', 'preferências', 'ajustes'],
      },
    ],
  },
  {
    id: 'calculadora',
    label: 'Calculadora',
    path: '/calculadora',
    icon: Calculator,
    keywords: ['calculadora', 'cálculo', 'simular', 'folha'],
    children: [
      {
        id: 'calculadora-decimo-terceiro',
        label: 'Décimo Terceiro',
        path: '/calculadora/decimo-terceiro',
        icon: Gift,
        keywords: ['décimo terceiro', '13º', '13', 'natal', 'avos', 'parcela'],
      },
    ],
  },
]

export function flattenNavItems(items: NavItem[] = NAV_ITEMS): FlatNavItem[] {
  return items.flatMap((item) => {
    if (!item.children?.length) return [item]

    const children = item.children.map((child) => ({
      ...child,
      parentLabel: item.label,
      parentId: item.id,
    }))

    return [{ ...item }, ...children]
  })
}

export function getSearchableNavItems(items: NavItem[] = NAV_ITEMS): FlatNavItem[] {
  return [...flattenNavItems(items).filter((item) => !item.children?.length), APP_SETTINGS_ITEM]
}

export function searchNavItems(query: string): FlatNavItem[] {
  const items = getSearchableNavItems()
  const normalized = query.trim().toLowerCase()
  if (!normalized) return items

  return items.filter((item) => {
    const haystack = [
      item.label,
      item.parentLabel ?? '',
      item.path,
      ...item.keywords,
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalized)
  })
}

export function findNavItemByPath(pathname: string, items: NavItem[] = NAV_ITEMS): FlatNavItem | undefined {
  const flat = flattenNavItems(items)
  const exact = flat.find((item) => item.path === pathname)
  if (exact) return exact

  return flat
    .filter((item) => item.path !== '/' && pathname.startsWith(item.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
}

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.children?.length) {
    return pathname === item.path || pathname.startsWith(`${item.path}/`)
  }
  return item.path === '/' ? pathname === '/' : pathname === item.path
}
