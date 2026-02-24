import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/Toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JobOrdersPage } from '@/pages/job-orders/JobOrdersPage';
import { EstimationPage } from '@/pages/estimation/EstimationPage';
import { ApprovalsPage } from '@/pages/approvals/ApprovalsPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

import { SettingsLayout } from '@/pages/settings/SettingsLayout';
import { CompanyPage } from '@/pages/settings/CompanyPage';
import { UsersPage } from '@/pages/settings/UsersPage';
import { RateCardsPage } from '@/pages/settings/RateCardsPage';
import { OverheadRatesPage } from '@/pages/settings/OverheadRatesPage';
import { TaxPage } from '@/pages/settings/TaxPage';
import { ClientsPage } from '@/pages/settings/ClientsPage';
import { VendorsPage } from '@/pages/settings/VendorsPage';
import { StaffPage } from '@/pages/settings/StaffPage';
import { MaterialsPage } from '@/pages/settings/MaterialsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected app shell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="job-orders" element={<JobOrdersPage />} />
            <Route path="job-orders/:jobId/estimation" element={<EstimationPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="execution" element={<PlaceholderPage title="Execution" description="Track site execution, progress updates, and BOQ actuals." />} />
            <Route path="finance" element={<PlaceholderPage title="Finance & Invoices" description="Generate invoices, record payments, and track receivables." />} />
            <Route path="reports" element={<PlaceholderPage title="Reports" description="Cost variance, revenue, and performance analytics." />} />

            {/* Settings */}
            <Route path="settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/company" replace />} />
              <Route path="company" element={<CompanyPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="rate-cards" element={<RateCardsPage />} />
              <Route path="overhead-rates" element={<OverheadRatesPage />} />
              <Route path="tax" element={<TaxPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="materials" element={<MaterialsPage />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
