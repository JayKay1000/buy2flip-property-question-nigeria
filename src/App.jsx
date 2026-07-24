import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/AdminLayout';

// Code-split pages for faster WebView initial paint
const Landing = lazy(() => import('./pages/Landing'));
const ContactOfficer = lazy(() => import('./pages/ContactOfficer'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Plans = lazy(() => import('./pages/Plans'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));
const Payment = lazy(() => import('./pages/Payment'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const Referrals = lazy(() => import('./pages/Referrals'));
const Support = lazy(() => import('./pages/Support'));
const SupportAssistant = lazy(() => import('./pages/SupportAssistant'));
const Terms = lazy(() => import('./pages/Terms'));
const Transactions = lazy(() => import('./pages/Transactions'));
const WithdrawalStatus = lazy(() => import('./pages/WithdrawalStatus'));
const DocumentCentre = lazy(() => import('./pages/DocumentCentre'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const AdminParticipants = lazy(() => import('./pages/admin/AdminParticipants'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminCommitments = lazy(() => import('./pages/admin/AdminCommitments'));
const AdminWithdrawals = lazy(() => import('./pages/admin/AdminWithdrawals'));
const AdminAnnouncements = lazy(() => import('./pages/admin/AdminAnnouncements'));
const AdminLeaderboard = lazy(() => import('./pages/admin/AdminLeaderboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminDocuments = lazy(() => import('./pages/admin/AdminDocuments'));
const SecuritySettings = lazy(() => import('./pages/SecuritySettings'));

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-brand rounded-full animate-spin" />
  </div>
);

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/contact-officer" element={<ContactOfficer />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/plans/:planName" element={<PlanDetail />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/withdrawal-status" element={<WithdrawalStatus />} />
          <Route path="/documents" element={<DocumentCentre />} />
          <Route path="/security-settings" element={<SecuritySettings />} />
          <Route path="/support" element={<Support />} />
          <Route path="/support-assistant" element={<SupportAssistant />} />
        </Route>
      </Route>
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminOverview />} />
        <Route path="participants" element={<AdminParticipants />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="commitments" element={<AdminCommitments />} />
        <Route path="withdrawals" element={<AdminWithdrawals />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="leaderboard" element={<AdminLeaderboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="documents" element={<AdminDocuments />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App