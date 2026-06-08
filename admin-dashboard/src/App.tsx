import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './state/store'
import { Login } from './pages/Login'
import { DashboardPro } from './pages/DashboardPro'
import { UsersPage } from './pages/UsersPage'
import { AccountsPage } from './pages/accountsPage'
import { ordersPage as OrdersPage } from './pages/ordersPage'
import { analyticsPage as AnalyticsPage } from './pages/analyticsPage'
import { settingsPage as SettingsPage } from './pages/settingsPage'
import { diagnosticsPage as DiagnosticsPage } from './pages/diagnosticsPage'
import { AdminLogsPage } from './pages/AdminLogsPage'
import { errorsPage as ErrorsPage } from './pages/errorsPage'
import { auditPage as AuditPage } from './pages/auditPage'
import { debugPage as DebugPage } from './pages/debugPage'
import { incidentsPage as IncidentsPage } from './pages/incidentsPage'
import { teamPage as TeamPage } from './pages/teamPage'
import { performancePage as PerformancePage } from './pages/performancePage'
import { tradingPage as TradingPage } from './pages/tradingPage'
import TradingBotPage from './pages/TradingBotPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

export function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Router>
      <Routes>
        {!isAuthenticated && <Route path="/login" element={<Login />} />}
        <Route path="/" element={<ProtectedRoute><DashboardPro /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute><AccountsPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/trading" element={<ProtectedRoute><TradingPage /></ProtectedRoute>} />
        <Route path="/trading-bot" element={<ProtectedRoute><TradingBotPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><DiagnosticsPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><AdminLogsPage /></ProtectedRoute>} />
        <Route path="/errors" element={<ProtectedRoute><ErrorsPage /></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
        <Route path="/debug" element={<ProtectedRoute><DebugPage /></ProtectedRoute>} />
        <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
        <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
        <Route path="/performance" element={<ProtectedRoute><PerformancePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
