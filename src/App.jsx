import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppLayout from '@/components/AppLayout';
import Landing from './pages/Landing';
import ContactOfficer from './pages/ContactOfficer';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import PlanDetail from './pages/PlanDetail';
import Payment from './pages/Payment';
import Portfolio from './pages/Portfolio';
import Referrals from './pages/Referrals';
import Support from './pages/Support';
import AdminRoute from '@/components/AdminRoute';
import AdminLayout from '@/components/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminParticipants from './pages/admin/AdminParticipants';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCommitments from './pages/admin/AdminCommitments';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';

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
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/contact-officer" element={<ContactOfficer />} />
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
          <Route path="/support" element={<Support />} />
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
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
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