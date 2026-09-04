import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AppShell } from "./layouts/AppShell";
import { AdminShell } from "./layouts/AdminShell";
import { NotFound } from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { RequireAuth } from "./lib/RequireAuth";

// User pages
const Landing      = lazy(() => import("./pages/Landing").then((m) => ({ default: m.Landing })));
const Dashboard    = lazy(() => import("./pages/app/Dashboard").then((m) => ({ default: m.Dashboard })));
const Documents    = lazy(() => import("./pages/app/Documents").then((m) => ({ default: m.Documents })));
const Intelligence = lazy(() => import("./pages/app/Intelligence").then((m) => ({ default: m.Intelligence })));
const Estimator    = lazy(() => import("./pages/app/Estimator").then((m) => ({ default: m.Estimator })));
const Prices       = lazy(() => import("./pages/app/Prices").then((m) => ({ default: m.Prices })));
const SharedFiles  = lazy(() => import("./pages/app/SharedFiles").then((m) => ({ default: m.SharedFiles })));
const Community    = lazy(() => import("./pages/app/Community").then((m) => ({ default: m.Community })));
const Profile      = lazy(() => import("./pages/app/Profile").then((m) => ({ default: m.Profile })));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminUsers     = lazy(() => import("./pages/admin/AdminUsers").then((m) => ({ default: m.AdminUsers })));
const AdminDocuments = lazy(() => import("./pages/admin/AdminDocuments").then((m) => ({ default: m.AdminDocuments })));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics").then((m) => ({ default: m.AdminAnalytics })));
const AdminRevenue   = lazy(() => import("./pages/admin/AdminRevenue").then((m) => ({ default: m.AdminRevenue })));
const AdminCommunity = lazy(() => import("./pages/admin/AdminCommunity").then((m) => ({ default: m.AdminCommunity })));
const AdminReports   = lazy(() => import("./pages/admin/AdminReports").then((m) => ({ default: m.AdminReports })));
const AdminSettings  = lazy(() => import("./pages/admin/AdminSettings").then((m) => ({ default: m.AdminSettings })));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="font-mono text-xs uppercase tracking-wide text-ink-soft">Loading…</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User routes */}
            <Route element={<RequireAuth />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard"    element={<Dashboard />} />
                <Route path="documents"    element={<Documents />} />
                <Route path="intelligence" element={<Intelligence />} />
                <Route path="estimator"    element={<Estimator />} />
                <Route path="prices"       element={<Prices />} />
                <Route path="shared"       element={<SharedFiles />} />
                <Route path="community"    element={<Community />} />
                <Route path="profile"      element={<Profile />} />
              </Route>
            </Route>

            {/* Admin routes */}
            <Route element={<RequireAuth requireAdmin />}>
              <Route path="/admin" element={<AdminShell />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users"      element={<AdminUsers />} />
                <Route path="documents"  element={<AdminDocuments />} />
                <Route path="analytics"  element={<AdminAnalytics />} />
                <Route path="revenue"    element={<AdminRevenue />} />
                <Route path="community"  element={<AdminCommunity />} />
                <Route path="reports"    element={<AdminReports />} />
                <Route path="settings"   element={<AdminSettings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
