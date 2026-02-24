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
import { ExecutionPage } from '@/pages/execution/ExecutionPage';
import { InvoicesListPage } from '@/pages/finance/InvoicesListPage';
import { InvoicePage } from '@/pages/finance/InvoicePage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { JobCostingReport } from '@/pages/reports/JobCostingReport';
import { JobsSummaryReport } from '@/pages/reports/JobsSummaryReport';
import { VarianceReport } from '@/pages/reports/VarianceReport';
import { ClientProfitabilityReport } from '@/pages/reports/ClientProfitabilityReport';
import { MaterialConsumptionReport } from '@/pages/reports/MaterialConsumptionReport';
import { LaborUtilizationReport } from '@/pages/reports/LaborUtilizationReport';
import { OverheadAnalysisReport } from '@/pages/reports/OverheadAnalysisReport';
import { InvoiceAgingReport } from '@/pages/reports/InvoiceAgingReport';

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
            <Route path="job-orders/:jobId/execution" element={<ExecutionPage />} />
            <Route path="finance" element={<InvoicesListPage />} />
            <Route path="finance/invoice/:jobId" element={<InvoicePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/job/:jobId" element={<JobCostingReport />} />
            <Route path="reports/jobs-summary" element={<JobsSummaryReport />} />
            <Route path="reports/variance" element={<VarianceReport />} />
            <Route path="reports/client-profitability" element={<ClientProfitabilityReport />} />
            <Route path="reports/material-consumption" element={<MaterialConsumptionReport />} />
            <Route path="reports/labor-utilization" element={<LaborUtilizationReport />} />
            <Route path="reports/overhead-analysis" element={<OverheadAnalysisReport />} />
            <Route path="reports/invoice-aging" element={<InvoiceAgingReport />} />

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
