import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/useAuth";
import { SocketProvider } from "./context/SocketContext";

// Landing + auth pages load eagerly (first paint)
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Everything else is code-split per route
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const FindMentorPage = lazy(() => import("./pages/FindMentorPage"));
const GroupsPage = lazy(() => import("./pages/GroupsPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const VerifyEmailPage = lazy(() => import("./pages/VerifyEmailPage"));
const TwoFactorPage = lazy(() => import("./pages/TwoFactorPage"));

// Student
const StudentDashboardPage = lazy(
  () => import("./pages/student/StudentDashboardPage"),
);
const StudentBusinessesPage = lazy(
  () => import("./pages/student/businessesPage"),
);
const StudentBusinessDetailPage = lazy(
  () => import("./pages/student/businessDetailPage"),
);
const StudentProductDetailPage = lazy(
  () => import("./pages/student/productDetailsPage"),
);
const AlumniDirectoryPage = lazy(
  () => import("./pages/student/AlumniDirectoryPage"),
);

// Alumni
const AlumniDashboardPage = lazy(
  () => import("./pages/alumni/AlumniDashboardPage"),
);
const AlumniStudentsPage = lazy(
  () => import("./pages/alumni/AlumniStudentsPage"),
);
const BusinessesPage = lazy(() => import("./pages/alumni/businessesPage"));
const BusinessDetailPage = lazy(
  () => import("./pages/alumni/businessDetailPage"),
);
const ProductsPage = lazy(() => import("./pages/alumni/productsPage"));
const ProductDetailsPage = lazy(
  () => import("./pages/alumni/productDetailsPage"),
);

// Admin
const AdminLoginPage = lazy(() => import("./pages/admin/AdminLoginPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageUsers = lazy(() => import("./pages/admin/ManageUsers"));
const AdminAlumniRosterPage = lazy(
  () => import("./pages/admin/AdminAlumniRosterPage"),
);
const ManageJobs = lazy(() => import("./pages/admin/ManageJobs"));
const ManageEvents = lazy(() => import("./pages/admin/ManageEvents"));
const ManageDepartments = lazy(
  () => import("./pages/admin/ManageDepartments"),
);
const AdminAnalyticsPage = lazy(
  () => import("./pages/admin/AdminAnalyticsPage"),
);
const AdminAcademicsPage = lazy(
  () => import("./pages/admin/AdminAcademicsPage"),
);

// ── Guards ──────────────────────────────────────────────────────────────────

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.mustChangePassword && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

// ── App ─────────────────────────────────────────────────────────────────────

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />

    <Route
      path="/login"
      element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      }
    />

    <Route
      path="/register"
      element={
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      }
    />

    <Route
      path="/forgot-password"
      element={
        <GuestRoute>
          <ForgotPasswordPage />
        </GuestRoute>
      }
    />

    <Route
      path="/reset-password"
      element={
        <GuestRoute>
          <ResetPasswordPage />
        </GuestRoute>
      }
    />

    <Route
      path="/admin/login"
      element={
        <GuestRoute>
          <AdminLoginPage />
        </GuestRoute>
      }
    />

    <Route
      path="/verify-email"
      element={
        <GuestRoute>
          <VerifyEmailPage />
        </GuestRoute>
      }
    />

    <Route
      path="/verify-2fa"
      element={
        <GuestRoute>
          <TwoFactorPage />
        </GuestRoute>
      }
    />

    <Route
      path="/change-password"
      element={
        <ProtectedRoute>
          <ChangePasswordPage />
        </ProtectedRoute>
      }
    />

    {/* Role redirect */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />

    {/* Student */}
    <Route
      path="/student/dashboard"
      element={
        <ProtectedRoute>
          <StudentDashboardPage />
        </ProtectedRoute>
      }
    />

    {/* Alumni */}
    <Route
      path="/alumni/dashboard"
      element={
        <ProtectedRoute>
          <AlumniDashboardPage />
        </ProtectedRoute>
      }
    />
        <Route
      path="/alumni/my_businesses"
      element={
        <ProtectedRoute>
          <BusinessesPage />
        </ProtectedRoute>
      }
    />

    <Route 
      path="/alumni/business_details/:business_id"
      element={
        <ProtectedRoute>
          <BusinessDetailPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/alumni/my_products"
      element={
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      }
    />
      <Route
      path="/alumni/product_details/:product_id"
      element={
        <ProtectedRoute>
          <ProductDetailsPage />
        </ProtectedRoute>
      }
    />
    {/* Shared (student + alumni) */}
    <Route
      path="/feed"
      element={
        <ProtectedRoute>
          <FeedPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/jobs"
      element={
        <ProtectedRoute>
          <JobsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/events"
      element={
        <ProtectedRoute>
          <EventsPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/messages"
      element={
        <ProtectedRoute>
          <MessagingPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/mentors"
      element={
        <ProtectedRoute>
          <FindMentorPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/groups"
      element={
        <ProtectedRoute>
          <GroupsPage />
        </ProtectedRoute>
      }
    />
 <Route
      path="/student/businesses"
      element={
        <ProtectedRoute>
          <StudentBusinessesPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/student/business_details/:business_id"
      element={
        <ProtectedRoute>
          <StudentBusinessDetailPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/student/product_details/:product_id"
      element={
        <ProtectedRoute>
          <StudentProductDetailPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/alumni"
      element={
        <ProtectedRoute>
          <AlumniDirectoryPage />
        </ProtectedRoute>
      }
    />

    <Route
      path="/students"
      element={
        <ProtectedRoute>
          <AlumniStudentsPage />
        </ProtectedRoute>
      }
    />

    {/* Admin */}
    <Route
      path="/admin"
      element={
        <AdminRoute>
          <AdminDashboard />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/users"
      element={
        <AdminRoute>
          <ManageUsers />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/departments"
      element={
        <AdminRoute>
          <ManageDepartments />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/jobs"
      element={
        <AdminRoute>
          <ManageJobs />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/events"
      element={
        <AdminRoute>
          <ManageEvents />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <AdminRoute>
          <AdminAnalyticsPage />
        </AdminRoute>
      }
    />
    <Route
      path="/admin/academic"
      element={
        <AdminRoute>
          <AdminAcademicsPage />
        </AdminRoute>
      }
    />
      <Route
        path="/admin/alumni-roster"
        element={
        <AdminRoute>
            <AdminAlumniRosterPage />
        </AdminRoute>
      }
/>
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile/:userId"
      element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/notifications"
      element={
        <ProtectedRoute>
          <NotificationsPage />
        </ProtectedRoute>
      }
    />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="w-8 h-8 border-4 border-[#1e3a6e] border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <Suspense fallback={<RouteFallback />}>
          <AppRoutes />
        </Suspense>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
