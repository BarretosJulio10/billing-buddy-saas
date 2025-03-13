
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "./hooks/auth/AuthProvider";
import { useAuth } from "./hooks/useAuth";
import { Toaster } from "./components/ui/toaster";
import { lazy, Suspense } from "react";
import Login from "@/pages/Login";
import CompleteProfile from "@/pages/CompleteProfile";
import BlockedPage from "@/pages/Blocked";
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
const ImpersonateOrg = lazy(() => import("@/pages/admin/ImpersonateOrg"));

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

  if (isBlocked && !isAdmin) {
    return <Navigate to="/blocked" replace />;
  }

  return children;
}

function RequireNoAuth({ children }: { children: JSX.Element }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (user) {
    // Redirect to appropriate panel based on user role
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
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
              
              <Route 
                path="/blocked" 
                element={<BlockedPage />} 
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
                <Route path="impersonate/:id" element={<ImpersonateOrg />} />
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
