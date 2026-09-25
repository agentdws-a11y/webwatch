import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WebsitesPage from './pages/WebsitesPage';
import WebsiteDetailsPage from './pages/WebsiteDetailsPage';
import AddWebsitePage from './pages/AddWebsitePage';
import ClientsPage from './pages/ClientsPage';
import MaintenancePage from './pages/MaintenancePage';
import NotificationsPage from './pages/NotificationsPage';
import CredentialsPage from './pages/CredentialsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ArchivePage from './pages/ArchivePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes — sab DashboardLayout ke andar wrapped */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/websites" element={<WebsitesPage />} />
        <Route path="/websites/add" element={<AddWebsitePage />} />
        <Route path="/websites/:id" element={<WebsiteDetailsPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/archive" element={<ArchivePage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;