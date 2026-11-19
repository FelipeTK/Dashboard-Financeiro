import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AppShell } from './components/layout/AppShell'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppSettingsPage } from './pages/AppSettingsPage'
import { AuthPage } from './pages/AuthPage'
import { DecimoTerceiroPage } from './pages/calculadora/DecimoTerceiroPage'
import { CartoesPage } from './pages/financeiro/CartoesPage'
import { ConfiguracoesPage } from './pages/financeiro/ConfiguracoesPage'
import { FinanceiroDashboardPage } from './pages/financeiro/DashboardPage'
import { PlanejamentoPage } from './pages/financeiro/PlanejamentoPage'
import { TransacoesPage } from './pages/financeiro/TransacoesPage'
import { HomePage } from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />

              <Route element={<RequireAuth />}>
                <Route element={<AppShell />}>
                  <Route index element={<HomePage />} />
                  <Route path="configuracoes" element={<AppSettingsPage />} />
                  <Route path="financeiro" element={<Navigate to="/financeiro/dashboard" replace />} />
                  <Route path="financeiro/dashboard" element={<FinanceiroDashboardPage />} />
                  <Route path="financeiro/transacoes" element={<TransacoesPage />} />
                  <Route path="financeiro/cartoes" element={<CartoesPage />} />
                  <Route path="financeiro/planejamento" element={<PlanejamentoPage />} />
                  <Route path="financeiro/configuracoes" element={<ConfiguracoesPage />} />
                  <Route path="calculadora" element={<Navigate to="/calculadora/decimo-terceiro" replace />} />
                  <Route path="calculadora/decimo-terceiro" element={<DecimoTerceiroPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
