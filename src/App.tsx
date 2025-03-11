
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import Index from '@/pages/Index';
import Customers from '@/pages/Customers';
import Invoices from '@/pages/Invoices';
import Collections from '@/pages/Collections';
import Settings from '@/pages/Settings';
import Trash from '@/pages/Trash';
import NotFound from '@/pages/NotFound';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout>
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
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
