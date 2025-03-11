
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./hooks/auth/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { lazy, Suspense } from "react";
import Login from "@/pages/Login";
import CompleteProfile from "@/pages/CompleteProfile";
import { ThemeProvider } from "next-themes";

// App Layout components
const AppLayout = lazy(() => import("@/components/layout/AppLayout"));
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout"));

// Regular pages
const Index = lazy(() => import("@/pages/Index"));
const Customers = lazy(() => import("@/pages/Customers"));
const Invoices = lazy(() => import("@/pages/Invoices"));
const Collections = lazy(() => import("@/pages/Collections"));
const Settings = lazy(() => import("@/pages/Settings"));
const Trash = lazy(() => import("@/pages/Trash"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminOrganizations = lazy(() => import("@/pages/admin/Organizations"));
const OrganizationDetail = lazy(() => import("@/pages/admin/OrganizationDetail"));

function RequireAuth({ children, isAdminRequired = false }: { children: JSX.Element, isAdminRequired?: boolean }) {
  const { user, loading, isAdmin, isBlocked } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdminRequired && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (isBlocked) {
    return <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-destructive mb-2">Conta Bloqueada</h1>
      <p className="text-muted-foreground mb-4">
        Sua conta está bloqueada devido a um problema com o pagamento. 
        Por favor, entre em contato com o suporte para mais informações.
      </p>
      <button 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        onClick={() => window.location.href = "mailto:support@pagoupix.com"}>
        Contatar Suporte
      </button>
    </div>;
  }

  return children;
}

function RequireNoAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Carregando...</div>}>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <RequireNoAuth>
                    <Login />
                  </RequireNoAuth>
                } 
              />
              
              <Route 
                path="/complete-profile" 
                element={
                  <RequireAuth>
                    <CompleteProfile />
                  </RequireAuth>
                } 
              />
              
              {/* Regular User Routes */}
              <Route 
                path="/" 
                element={
                  <RequireAuth>
                    <AppLayout>
                      <Outlet />
                    </AppLayout>
                  </RequireAuth>
                }
              >
                <Route index element={<Index />} />
                <Route path="customers" element={<Customers />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="collections" element={<Collections />} />
                <Route path="settings" element={<Settings />} />
                <Route path="trash" element={<Trash />} />
              </Route>
              
              {/* Admin Routes */}
              <Route 
                path="/admin" 
                element={
                  <RequireAuth isAdminRequired={true}>
                    <AdminLayout>
                      <Outlet />
                    </AdminLayout>
                  </RequireAuth>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="organizations" element={<AdminOrganizations />} />
                <Route path="organizations/:id" element={<OrganizationDetail />} />
              </Route>
              
              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
