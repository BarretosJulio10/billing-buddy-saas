
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Customers from '@/pages/Customers';
import Invoices from '@/pages/Invoices';
import Collections from '@/pages/Collections';
import Settings from '@/pages/Settings';
import Trash from '@/pages/Trash';
import NotFound from '@/pages/NotFound';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminOrganizations from '@/pages/admin/Organizations';
import AdminOrganizationDetail from '@/pages/admin/OrganizationDetail';
import { SubscriptionAlert } from '@/components/subscription/SubscriptionAlert';
import { SubscriptionBlocked } from '@/components/subscription/SubscriptionBlocked';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, loading, isAdmin, isBlocked } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (isBlocked && !isAdmin) {
    return <SubscriptionBlocked />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas de Empresa */}
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
                <SubscriptionAlert />
                <Outlet />
              </AppLayout>
            </PrivateRoute>
          }>
            <Route index element={<Index />} />
            <Route path="customers" element={<Customers />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="collections" element={<Collections />} />
            <Route path="settings" element={<Settings />} />
            <Route path="trash" element={<Trash />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Rotas de Admin */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="organizations" element={<AdminOrganizations />} />
            <Route path="organizations/:id" element={<AdminOrganizationDetail />} />
          </Route>
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
