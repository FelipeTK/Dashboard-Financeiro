import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function RequireAuth() {
  const { user, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return <Outlet />
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-ink text-fog">
        Carregando sessão...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
