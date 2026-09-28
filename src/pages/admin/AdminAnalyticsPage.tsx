import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BarChart3,
  Briefcase,
  Download,
  GraduationCap,
  Layers,
  MapPin,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import {
  PageHeader,
  StatCard,
  Select,
  SectionHeader,
} from "../../components/shared";
import { getAnalyticsDatasetApi } from "../../api/analyticsApi";
import { ANALYTICS_FILTER_OPTIONS } from "../../data/analyticsFilters";
import { DEPARTMENTS } from "../../data/departments";
import type { AnalyticsDataset, AnalyticsFilters } from "../../types/analytics";

const COLORS = ["#27155f", "#e40d0a", "#3a2080", "#10b981", "#f59e0b", "#6366f1", "#0ea5e9", "#d946ef"];

const EMPTY_DATASET: AnalyticsDataset = {
  studentsVsAlumni: [],
  newRegistrations: [],
  activeUsers: [],
  alumniByDepartment: [],
  usersByProgramme: [],
  graduationDistribution: [],
  campusDistribution: [],
  engagement: {
    posts: 0,
    likes: 0,
    comments: 0,
    connections: 0,
    eventParticipants: 0,
    mentorship: 0,
  },
  engagementTrend: [],
  career: {
    jobsPosted: 0,
    applications: 0,
    savedJobs: 0,
    pendingJobs: 0,
    hires: 0,
  },
  applicationsByJob: [],
};

const AdminAnalyticsPage = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [applied, setApplied] = useState<AnalyticsFilters>({});
  const [dataset, setDataset] = useState<AnalyticsDataset | null>(null);
  const [loadingDataset, setLoadingDataset] = useState(true);
  const [datasetError, setDatasetError] = useState("");

  const fetchDataset = useCallback((next: AnalyticsFilters) => {
    return getAnalyticsDatasetApi(next)
      .then((d) => {
        setDataset(d);
        setDatasetError("");
      })
      .catch(() => setDatasetError("Could not load analytics data."))
      .finally(() => setLoadingDataset(false));
  }, []);

  useEffect(() => {
    void fetchDataset({});
  }, [fetchDataset]);

  const data = dataset ?? EMPTY_DATASET;

  const studentsTotal =
    data.studentsVsAlumni.find((d) => d.name === "Students")?.value ?? 0;
  const alumniTotal =
    data.studentsVsAlumni.find((d) => d.name === "Alumni")?.value ?? 0;
  const activeUsers = Math.round(
    data.activeUsers.reduce((acc, d) => acc + d.count, 0) /
      Math.max(1, data.activeUsers.length),
  );
  const totalEngagement =
    data.engagement.posts +
    data.engagement.likes +
    data.engagement.comments +
    data.engagement.connections +
    data.engagement.eventParticipants;

  const deptOptions = DEPARTMENTS.map((d) => ({ value: d.name, label: d.name }));
  const yearOptions = ANALYTICS_FILTER_OPTIONS.graduationYears.map((y) => ({
    value: String(y),
    label: String(y),
  }));
  const campusOptions = ANALYTICS_FILTER_OPTIONS.campuses.map((c) => ({
    value: c,
    label: c,
  }));
  const entryTypeOptions = ANALYTICS_FILTER_OPTIONS.entryTypes.map((t) => ({
    value: t,
    label: t,
  }));

  return (
    <PageContainer title="Analytics & Insights">
      <div className="space-y-6">
        <PageHeader
          icon={BarChart3}
          title="Analytics & Insights"
          subtitle="Track registrations, engagement and career outcomes across the community."
          actions={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-accent"
              onClick={() => {
                const blob = new Blob(
                  [JSON.stringify(data, null, 2)],
                  { type: "application/json" },
                );
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "analytics-export.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" /> Export
            </button>
          }
        />

        {/* Filters */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <SectionHeader
            icon={Layers}
            title="Filter analytics"
            action={
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setLoadingDataset(true);
                    setFilters({});
                    setApplied({});
                    void fetchDataset({});
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:underline"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
                <button
                  type="button"
                  disabled={loadingDataset}
                  onClick={() => {
                    setLoadingDataset(true);
                    setApplied(filters);
                    void fetchDataset(filters);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-primary/90 disabled:opacity-60"
                >
                  {loadingDataset ? "Loading…" : "Apply filters"}
                </button>
              </div>
            }
          />
          {datasetError && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {datasetError}
            </p>
          )}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Select
              label="User type"
              placeholder="All user types"
              value={filters.userType ?? ""}
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  userType: (v || "all") as AnalyticsFilters["userType"],
                }))
              }
              options={[
                { value: "all", label: "All user types" },
                { value: "student", label: "Students" },
                { value: "alumni", label: "Alumni" },
              ]}
            />
            <Select
              label="Department"
              placeholder="All departments"
              value={filters.department ?? ""}
              onChange={(v) =>
                setFilters((f) => ({ ...f, department: v || undefined }))
              }
              options={[{ value: "all", label: "All departments" }, ...deptOptions]}
            />
            <Select
              label="Graduation year"
              placeholder="All years"
              value={
                filters.graduationYear && filters.graduationYear !== "all"
                  ? String(filters.graduationYear)
                  : ""
              }
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  graduationYear:
                    v && v !== "all" ? Number(v) : ("all" as const),
                }))
              }
              options={[{ value: "all", label: "All years" }, ...yearOptions]}
            />
            <Select
              label="Campus"
              placeholder="All campuses"
              value={filters.campus ?? ""}
              onChange={(v) =>
                setFilters((f) => ({ ...f, campus: v || undefined }))
              }
              options={[
                { value: "all", label: "All campuses" },
                ...campusOptions,
              ]}
            />
            <Select
              label="Entry type"
              placeholder="All entry types"
              value={filters.entryType ?? ""}
              onChange={(v) =>
                setFilters((f) => ({ ...f, entryType: v || undefined }))
              }
              options={[
                { value: "all", label: "All entry types" },
                ...entryTypeOptions,
              ]}
            />
          </div>
        </section>

        {/* Top stats */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Students"
            value={studentsTotal.toLocaleString()}
            icon={GraduationCap}
            accent="indigo"
            hint={applied.department ?? "All departments"}
          />
          <StatCard
            label="Total Alumni"
            value={alumniTotal.toLocaleString()}
            icon={UserCheck}
            accent="green"
            hint={applied.userType === "alumni" ? "Alumni only" : "Across all roles"}
          />
          <StatCard
            label="Active Users (avg)"
            value={activeUsers.toLocaleString()}
            icon={Activity}
            accent="brand"
            hint="Monthly average"
          />
          <StatCard
            label="Engagement Actions"
            value={totalEngagement.toLocaleString()}
            icon={Sparkles}
            accent="red"
            hint="Posts + likes + comments + connects"
          />
        </section>

        {/* Charts row 1 */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={TrendingUp} title="New Registrations by Month" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.newRegistrations} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="students" name="Students" fill="#27155f" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="alumni" name="Alumni" fill="#e40d0a" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={Users} title="Students vs Alumni" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.studentsVsAlumni}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={92}
                    paddingAngle={3}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {data.studentsVsAlumni.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Charts row 2 */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={Activity} title="Active Users Trend" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={data.activeUsers}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ stroke: "#ddd" }} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Active users"
                    stroke="#27155f"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#27155f" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={MapPin} title="Campus Distribution" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.campusDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                  >
                    {data.campusDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Charts row 3 */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={Layers} title="Alumni by Department" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.alumniByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" name="Alumni" fill="#3a2080" radius={[0, 3, 3, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={GraduationCap} title="Graduation Cohorts" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.graduationDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" name="Alumni" fill="#e40d0a" radius={[3, 3, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Engagement trend */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <SectionHeader icon={Sparkles} title="Community Engagement Trend" />
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.engagementTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip cursor={{ stroke: "#ddd" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="posts" name="Posts" stroke="#27155f" strokeWidth={2} />
                <Line type="monotone" dataKey="connections" name="Connections" stroke="#e40d0a" strokeWidth={2} />
                <Line type="monotone" dataKey="mentorships" name="Mentorships" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Career outcomes */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={Briefcase} title="Career Milestones" />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Jobs posted", value: data.career.jobsPosted },
                { label: "Applications", value: data.career.applications },
                { label: "Saved jobs", value: data.career.savedJobs },
                { label: "Pending review", value: data.career.pendingJobs },
                { label: "Reported hires", value: data.career.hires },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-muted/40 p-4 text-center">
                  <p className="text-xl font-bold text-brand-primary">{item.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
              <div className="flex items-center justify-center rounded-xl bg-brand-primary/10 p-2 text-center">
                <p className="text-[11px] font-semibold text-brand-primary">
                  {data.career.hires}/{data.career.jobsPosted} roles filled
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <SectionHeader icon={Target} title="Applications by Role" />
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={data.applicationsByJob} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="value" name="Applications" fill="#10b981" radius={[0, 3, 3, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
};

export default AdminAnalyticsPage;