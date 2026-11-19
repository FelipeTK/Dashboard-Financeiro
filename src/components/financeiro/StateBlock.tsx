type StateBlockProps = {
  loading?: boolean
  error?: string | null
  empty?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function StateBlock({
  loading,
  error,
  empty,
  emptyTitle = 'Nada por aqui ainda',
  emptyDescription = 'Comece cadastrando seus primeiros dados financeiros.',
}: StateBlockProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-line-soft bg-elevated/40 px-4 py-10 text-center text-sm text-fog">
        Carregando dados do Supabase...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-6 text-sm text-rose-200">
        {error}
      </div>
    )
  }

  if (empty) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-elevated/30 px-4 py-10 text-center">
        <p className="font-display text-lg font-semibold text-snow">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-fog">{emptyDescription}</p>
      </div>
    )
  }

  return null
}
