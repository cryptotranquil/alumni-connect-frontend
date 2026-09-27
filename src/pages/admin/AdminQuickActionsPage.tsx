import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
  Radar,
  Users,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/shared";

const quickActions = [
  { label: "Manage Users", desc: "Approve, filter & manage accounts", path: "/admin/users", icon: Users },
  { label: "Academic Structure", desc: "Departments & programmes", path: "/admin/academic", icon: Radar },
  { label: "Moderate Jobs", desc: "Approve or reject postings", path: "/admin/jobs", icon: Briefcase },
  { label: "Manage Events", desc: "Create and delete events", path: "/admin/events", icon: CalendarDays },
  { label: "Alumni Roster", desc: "View and export alumni data", path: "/admin/alumni-roster", icon: FileSpreadsheet },
];

const AdminQuickActionsPage = () => (
  <PageContainer title="Quick Actions" showLogo>
    <div className="space-y-6">
      <PageHeader
        icon={CheckCircle2}
        title="Quick Actions"
        subtitle="Manage common admin tasks."
      />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.path}
              to={action.path}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-primary/30 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors group-hover:bg-brand-primary group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-3 font-semibold text-foreground">{action.label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{action.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-primary">
                Open <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          );
        })}
      </section>
    </div>
  </PageContainer>
);

export default AdminQuickActionsPage;