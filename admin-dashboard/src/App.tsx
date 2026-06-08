import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './state/store'
import { Login } from './pages/Login'
import { DashboardPro } from './pages/DashboardPro'
import { UsersPage } from './pages/UsersPage'
import { AccountsPage } from './pages/accountsPage'
import { OrdersPage } from './pages/ordersPage'
import { AnalyticsPage } from './pages/analyticsPage'
import { SettingsPage } from './pages/settingsPage'
import { DiagnosticsPage } from './pages/diagnosticsPage'
import { LogsPage } from './pages/logsPage'
import { ErrorsPage } from './pages/errorsPage'
import { AuditPage } from './pages/auditPage'
import { DebugPage } from './pages/debugPage'
import { IncidentsPage } from './pages/incidentsPage'
import { TeamPage } from './pages/teamPage'
import { PerformancePage } from './pages/performancePage'

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
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/diagnostics" element={<ProtectedRoute><DiagnosticsPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
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
