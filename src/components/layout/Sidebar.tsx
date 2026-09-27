import { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { BarChart3, BriefcaseBusiness, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AC_SOCKET_EVENT } from "../../context/SocketContext";
import { getAlumniConnectionsApi } from "../../api/connectionApi";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const IconDashboard = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);
const IconJobs = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
const IconEvents = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const IconMessages = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const IconUsers = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconBell = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const IconFeed = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 6l-10 7L2 6" />
    <rect x="2" y="4" width="20" height="16" rx="2" />
  </svg>
);
const IconMentorship = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);
const IconGroups = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const IconProfile = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconLogout = () => (
  <svg
    className="w-5 h-5 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ── Nav items point directly to role-specific paths ───────────────────────────
// This avoids the /dashboard → /student/dashboard double-redirect flicker.
const studentNav: NavItem[] = [
  { label: "Dashboard", path: "/student/dashboard", icon: <IconDashboard /> },
  { label: "Community", path: "/feed", icon: <IconFeed /> },
  { label: "Jobs", path: "/jobs", icon: <IconJobs /> },
  { label: "Businesses", path: "/student/businesses", icon: <IconJobs /> },
  { label: "Events", path: "/events", icon: <IconEvents /> },
  { label: "Groups", path: "/groups", icon: <IconGroups /> },
  { label: "Mentors", path: "/mentors", icon: <IconMentorship /> },
  { label: "Messages", path: "/messages", icon: <IconMessages /> },
  { label: "Alumni", path: "/alumni", icon: <IconUsers /> },
  { label: "Profile", path: "/profile", icon: <IconProfile /> },
  { label: "Notifications", path: "/notifications", icon: <IconBell /> },
];

const alumniNav: NavItem[] = [
  { label: "Dashboard", path: "/alumni/dashboard", icon: <IconDashboard /> },
  { label: "Community", path: "/feed", icon: <IconFeed /> },
  { label: "Post Jobs", path: "/jobs", icon: <IconJobs /> },
  { label: "Businesses", path: "/alumni/my_businesses", icon: <IconJobs /> },
  { label: "Products", path: "/alumni/my_products", icon: <IconJobs /> },
  { label: "Events", path: "/events", icon: <IconEvents /> },
  { label: "Groups", path: "/groups", icon: <IconGroups /> },
  { label: "Mentorship", path: "/mentors", icon: <IconMentorship /> },
  { label: "Messages", path: "/messages", icon: <IconMessages /> },
  { label: "Students", path: "/students", icon: <IconUsers /> },
  { label: "Profile", path: "/profile", icon: <IconProfile /> },
  { label: "Notifications", path: "/notifications", icon: <IconBell /> },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin", icon: <IconDashboard /> },
  { label: "Full Analytics", path: "/admin/analytics", icon: <BarChart3 className="w-5 h-5 shrink-0" /> },
  { label: "Users", path: "/admin/users", icon: <IconUsers /> },
  { label: "Jobs", path: "/admin/jobs", icon: <IconJobs /> },
  { label: "Events", path: "/admin/events", icon: <IconEvents /> },
  { label: "Quick Actions", path: "/admin/quick-actions", icon: <CheckCircle2 className="w-5 h-5 shrink-0" /> },
  { label: "Career Milestones", path: "/admin/career-milestones", icon: <BriefcaseBusiness className="w-5 h-5 shrink-0" /> },
];

// ── Extracted as a module-level component (NOT defined inside Sidebar) ────────
// Defining it inside Sidebar caused React to treat it as a new component type
// on every render, fully unmounting/remounting it and causing the flicker.
interface SidebarContentProps {
  user: ReturnType<typeof useAuth>["user"];
  navItems: NavItem[];
  pendingStudentRequests: number;
  onNavigate: () => void;
  onLogout: () => void;
  variant: "desktop" | "mobile";
}

const SidebarContent = ({
  user,
  navItems,
  pendingStudentRequests,
  onNavigate,
  onLogout,
  variant,
}: SidebarContentProps) => (
  <aside
    className={`bg-[#1e3a6e] flex flex-col ${
      variant === "desktop"
        ? "w-full h-full"
        : "w-full max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl shadow-2xl ring-1 ring-black/5"
    }`}
  >
    {/* User info */}
    <Link
      to="/profile"
      onClick={onNavigate}
      className="flex items-center gap-3 px-5 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
    >
      <div className="w-9 h-9 rounded-full bg-[#d2621a] flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
        {user?.profilePhoto ? (
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        ) : (
          user?.name?.charAt(0).toUpperCase() || "U"
        )}
      </div>
      <div className="min-w-0">
        <p className="text-white text-sm font-semibold truncate">
          {user?.name}
        </p>
        <p className="text-blue-200 text-xs capitalize">{user?.role}</p>
      </div>
    </Link>

    {/* Nav */}
    <nav className="flex-1 px-3 py-4 space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              isActive
                ? "bg-white/15 text-white"
                : "text-blue-200 hover:bg-white/10 hover:text-white"
            }`
          }
        >
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.path === "/students" && pendingStudentRequests > 0 && (
            <span
              className="min-w-[1.25rem] rounded-full bg-[#d2621a] px-1.5 py-0.5 text-center text-[10px] font-bold text-white"
              title="Pending connection requests"
            >
              {pendingStudentRequests > 9 ? "9+" : pendingStudentRequests}
            </span>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Logout */}
    <div className="px-3 py-4 border-t border-white/10">
      <Link
        to="/login"
        onClick={onLogout}
        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition-all duration-150"
      >
        <IconLogout />
        Logout
      </Link>
    </div>
  </aside>
);

// ── Sidebar shell (handles mobile top-menu state) ─────────────────────────────
const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { user, logout } = useAuth();
  const [pendingStudentRequests, setPendingStudentRequests] = useState(0);

  useEffect(() => {
    if (user?.role !== "alumni") return;
    const load = () => {
      getAlumniConnectionsApi()
        .then((d) => setPendingStudentRequests(d.pending.length))
        .catch(() => setPendingStudentRequests(0));
    };
    load();
    window.addEventListener(AC_SOCKET_EVENT, load);
    return () => window.removeEventListener(AC_SOCKET_EVENT, load);
  }, [user?.role]);

  const navItems =
    user?.role === "admin"
      ? adminNav
      : user?.role === "alumni"
        ? alumniNav
        : studentNav;

  const handleLogout = () => {
    logout();
    onClose();
  };

  const sharedProps = {
    user,
    navItems,
    pendingStudentRequests,
    onNavigate: onClose,
    onLogout: handleLogout,
  };

  return (
    <>
      {/* Desktop sidebar — hidden below md; full-height fixed left column */}
      <div className="hidden md:flex fixed left-0 top-0 z-30 h-screen w-64">
        <SidebarContent {...sharedProps} variant="desktop" />
      </div>

      {/* Mobile: backdrop behind the top menu */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Mobile: menu drops from the upper-left corner, under the hamburger */}
      <div
        className={`md:hidden fixed left-4 top-16 z-40 w-[19rem] max-w-[calc(100vw-2rem)] transition-all duration-200 ease-out origin-top-left ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 bg-[#1e3a6e] ring-1 ring-black/5" />
        <SidebarContent {...sharedProps} variant="mobile" />
      </div>
    </>
  );
};

export default Sidebar;
