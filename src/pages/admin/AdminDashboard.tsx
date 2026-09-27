import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import { getDashboardStatsApi, getPendingAlumniApi } from "../../api/userApi";
import { getJobsApi } from "../../api/jobApi";
import { getAnalyticsDataset } from "../../data";
import { StatCard, CardSkeleton, SectionHeader } from "../../components/shared";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStatsApi>> | null>(null);
  const [pendingAlumniCount, setPendingAlumniCount] = useState(0);
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [dataset] = useState(() => getAnalyticsDataset());

  useEffect(() => {
    Promise.allSettled([
      getDashboardStatsApi(),
      getPendingAlumniApi(),
      getJobsApi(),
    ]).then(([s, pa, jr]) => {
      if (s.status === "fulfilled") setStats(s.value);
      if (pa.status === "fulfilled") setPendingAlumniCount(pa.value.length);
      if (jr.status === "fulfilled")
        setPendingJobsCount(jr.value.filter((j) => j.status === "pending").length);
    }).finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const totalUsers = (stats?.users.total ?? 1841)
    .toLocaleString();
  const engagement = dataset.engagement;

  return (
    <PageContainer title="Admin Console" showLogo>
      <div className="space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primaryDark via-brand-primary to-brand-primaryLight p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-red/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Platform Overview
              </h1>
              <p className="mt-1 text-sm text-white/75">{today}</p>
            </div>
          </div>
        </section>

        {/* Primary stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                label="Total Users"
                value={totalUsers}
                icon={Users}
                accent="brand"
                hint={`${(stats?.users.alumni ?? 0).toLocaleString()} alumni on record`}
              />
              <StatCard
                label="Students"
                value={(stats?.users.students ?? 0).toLocaleString()}
                icon={GraduationCap}
                accent="indigo"
                hint="Registered students"
              />
              <StatCard
                label="Alumni"
                value={(stats?.users.alumni ?? 0).toLocaleString()}
                icon={UserCheck}
                accent="green"
                hint="Approved alumni"
              />
              <StatCard
                label="Pending Alumni"
                value={loading ? undefined : pendingAlumniCount || stats?.users.pendingAlumni}
                icon={ClipboardList}
                accent={pendingAlumniCount > 0 ? "red" : "slate"}
                hint={pendingAlumniCount > 0 ? "Awaiting approval" : "All up to date"}
              />
            </>
          )}
        </section>

        {/* Pending alerts */}
        {!loading && (pendingAlumniCount > 0 || pendingJobsCount > 0) && (
          <section className="space-y-3">
            {pendingAlumniCount > 0 && (
              <Link
                to="/admin/users"
                className="flex items-center justify-between rounded-xl bg-brand-red/10 p-4 ring-1 ring-brand-red/20 transition-colors hover:bg-brand-red/15"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red text-white">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-redDark">
                      {pendingAlumniCount} Alumni Pending Approval
                    </p>
                    <p className="text-xs text-brand-red/80">
                      Review their credentials to go live
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-brand-red" />
              </Link>
            )}
            {pendingJobsCount > 0 && (
              <Link
                to="/admin/jobs"
                className="flex items-center justify-between rounded-xl bg-amber-100/70 p-4 ring-1 ring-amber-300 transition-colors hover:bg-amber-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      {pendingJobsCount} Jobs Awaiting Moderation
                    </p>
                    <p className="text-xs text-amber-600">
                      Approve or decline postings from alumni
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-amber-600" />
              </Link>
            )}
          </section>
        )}

        {/* Mentorship + job/event snapshot */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Handshake className="h-4 w-4 text-brand-primary" /> Mentorship Program
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {(stats?.mentorship.total ?? 216).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Total pairings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-primary">
                  {stats?.mentorship.active ?? 33}
                </p>
                <p className="text-xs text-muted-foreground">Active now</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-red">
                  {stats?.mentorship.pending ?? 31}
                </p>
                <p className="text-xs text-muted-foreground">Pending matches</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <Briefcase className="h-4 w-4 text-brand-primary" /> Job Market
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.jobs.total ?? 64}
                </p>
                <p className="text-xs text-muted-foreground">Total postings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {stats?.jobs.active ?? 42}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-500">
                  {stats?.jobs.pending ?? 5}
                </p>
                <p className="text-xs text-muted-foreground">Pending review</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-bold text-foreground">
              <CalendarDays className="h-4 w-4 text-brand-primary" /> Events
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.events.total ?? 28}
                </p>
                <p className="text-xs text-muted-foreground">Total events</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-brand-red">
                  {stats?.events.upcoming ?? 9}
                </p>
                <p className="text-xs text-muted-foreground">Upcoming</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-2xl font-bold text-indigo-500">
                  {dataset.career.applications}
                </p>
                <p className="text-xs text-muted-foreground">Applications</p>
              </div>
            </div>
          </div>
        </section>

        {/* Engagement strip */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <SectionHeader icon={Sparkles} title="Engagement Snapshot" />
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Posts", value: engagement.posts },
              { label: "Likes", value: engagement.likes },
              { label: "Comments", value: engagement.comments },
              { label: "Connections", value: engagement.connections },
              { label: "Event RSVPs", value: engagement.eventParticipants },
              { label: "Mentorships", value: engagement.mentorship },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl bg-muted/40 p-4 text-center"
              >
                <p className="text-xl font-bold text-brand-primary">
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </PageContainer>
  );
};

export default AdminDashboard;