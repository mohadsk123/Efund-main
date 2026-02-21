import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";
import EligibilityChecker from "./pages/EligibilityChecker";
import Analytics from "./pages/Analytics";
import Beneficiaries from "./pages/Beneficiaries";
import React from "react";
const Transactions = React.lazy(() => import("./pages/Transactions"));
const Schemes = React.lazy(() => import("./pages/Schemes"));
const Security = React.lazy(() => import("./pages/Security"));
const Documentation = React.lazy(() => import("./pages/Documentation"));
const Support = React.lazy(() => import("./pages/Support"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ContractInteraction = React.lazy(() => import("./pages/ContractInteraction"));
const Auth = React.lazy(() => import("./pages/Auth"));
const AdminSchemes = React.lazy(() => import("./pages/AdminSchemes"));
const AdminApplications = React.lazy(() => import("./pages/AdminApplications"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminUsers = React.lazy(() => import("./pages/AdminUsers"));
const BeneficiaryProfile = React.lazy(() => import("./pages/BeneficiaryProfile"));
const Apply = React.lazy(() => import("./pages/Apply"));
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return session ? <>{children}</> : <Navigate to="/auth" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return <Navigate to="/auth" replace />;
  return session.role === "admin" ? <>{children}</> : <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route index element={<Index />} />
                <Route path="/eligibility" element={<EligibilityChecker />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/beneficiaries" element={<Beneficiaries />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/schemes" element={<Schemes />} />
                <Route path="/apply" element={<Apply />} />
                <Route path="/admin-schemes" element={<AdminRoute><AdminSchemes /></AdminRoute>} />
                <Route path="/admin-applications" element={<AdminRoute><AdminApplications /></AdminRoute>} />
                <Route path="/admin-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/profile" element={<BeneficiaryProfile />} />
                <Route path="/security" element={<Security />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/support" element={<Support />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/contract-interaction" element={<AdminRoute><ContractInteraction /></AdminRoute>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
