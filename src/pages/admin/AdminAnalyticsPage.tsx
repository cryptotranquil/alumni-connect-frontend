import { useMemo, useState } from "react";
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
  Download,
  GraduationCap,
  MapPin,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import { AdminSidebar } from "../../components/admin/AdminSidebar";
import AnalyticsChartCard, {
  type ChartType,
} from "../../components/admin/AnalyticsChartCard";
import {
  PageHeader,
  StatCard,
} from "../../components/shared";
import {
  getAnalyticsDataset,
  type AnalyticsFilters,
} from "../../data/mockAnalytics";

const COLORS = ["#27155f", "#e40d0a", "#3a2080", "#10b981", "#f59e0b", "#6366f1", "#0ea5e9", "#d946ef"];
type ChartId =
  | "registrations"
  | "students-alumni"
  | "active-users"
  | "campus"
  | "department"
  | "graduation"
  | "engagement"
  | "applications";

const AdminAnalyticsPage = () => {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const [applied, setApplied] = useState<AnalyticsFilters>({});
  const [chartTypes, setChartTypes] = useState<Partial<Record<ChartId, ChartType>>>({});
  const [expandedChart, setExpandedChart] = useState<ChartId | null>(null);

  const dataset = useMemo(() => getAnalyticsDataset(applied), [applied]);
  const chartMode = (id: ChartId, fallback: ChartType) => chartTypes[id] ?? fallback;
  const updateChartMode = (id: ChartId, type: ChartType) =>
    setChartTypes((current) => ({ ...current, [id]: type }));

  const studentsTotal =
    dataset.studentsVsAlumni.find((d) => d.name === "Students")?.value ?? 0;
  const alumniTotal =
    dataset.studentsVsAlumni.find((d) => d.name === "Alumni")?.value ?? 0;
  const activeUsers = Math.round(
    dataset.activeUsers.reduce((acc, d) => acc + d.count, 0) /
    Math.max(1, dataset.activeUsers.length),
  );
  const totalEngagement =
    dataset.engagement.posts +
    dataset.engagement.likes +
    dataset.engagement.comments +
    dataset.engagement.connections +
    dataset.engagement.eventParticipants;

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
                    [JSON.stringify(dataset, null, 2)],
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

          <AdminSidebar
            filters={filters}
            onFiltersChange={setFilters}
            onApply={() => setApplied(filters)}
          />

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
            <AnalyticsChartCard
              title="New Registrations by Month"
              icon={TrendingUp}
              chartType={chartMode("registrations", "bar")}
              availableChartTypes={["bar", "line"]}
              onChartTypeChange={(type) => updateChartMode("registrations", type)}
              expanded={expandedChart === "registrations"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "registrations" ? null : "registrations",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "registrations" ? "100%" : 260}
              >
                {chartMode("registrations", "bar") === "bar" ? (
                  <BarChart data={dataset.newRegistrations} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="students" name="Students" fill="#27155f" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="alumni" name="Alumni" fill="#e40d0a" radius={[3, 3, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={dataset.newRegistrations}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line type="monotone" dataKey="students" name="Students" stroke="#27155f" strokeWidth={2} />
                    <Line type="monotone" dataKey="alumni" name="Alumni" stroke="#e40d0a" strokeWidth={2} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>

            <AnalyticsChartCard
              title="Students vs Alumni"
              icon={Users}
              chartType={chartMode("students-alumni", "pie")}
              availableChartTypes={["pie", "bar"]}
              onChartTypeChange={(type) => updateChartMode("students-alumni", type)}
              expanded={expandedChart === "students-alumni"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "students-alumni" ? null : "students-alumni",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "students-alumni" ? "100%" : 260}
              >
                {chartMode("students-alumni", "pie") === "pie" ? (
                  <PieChart>
                    <Pie
                      data={dataset.studentsVsAlumni}
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
                      {dataset.studentsVsAlumni.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <BarChart data={dataset.studentsVsAlumni}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Users" radius={[3, 3, 0, 0]}>
                      {dataset.studentsVsAlumni.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>
          </section>

          {/* Charts row 2 */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsChartCard
              title="Active Users Trend"
              icon={Activity}
              chartType={chartMode("active-users", "line")}
              availableChartTypes={["line", "bar"]}
              onChartTypeChange={(type) => updateChartMode("active-users", type)}
              expanded={expandedChart === "active-users"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "active-users" ? null : "active-users",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "active-users" ? "100%" : 260}
              >
                {chartMode("active-users", "line") === "line" ? (
                  <LineChart data={dataset.activeUsers}>
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
                ) : (
                  <BarChart data={dataset.activeUsers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip />
                    <Bar dataKey="count" name="Active users" fill="#27155f" radius={[3, 3, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>

            <AnalyticsChartCard
              title="Campus Distribution"
              icon={MapPin}
              chartType={chartMode("campus", "pie")}
              availableChartTypes={["pie", "bar"]}
              onChartTypeChange={(type) => updateChartMode("campus", type)}
              expanded={expandedChart === "campus"}
              onToggleExpand={() =>
                setExpandedChart((current) => (current === "campus" ? null : "campus"))
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "campus" ? "100%" : 260}
              >
                {chartMode("campus", "pie") === "pie" ? (
                  <PieChart>
                    <Pie
                      data={dataset.campusDistribution}
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
                      {dataset.campusDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <BarChart data={dataset.campusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Users" radius={[3, 3, 0, 0]}>
                      {dataset.campusDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>
          </section>

          {/* Charts row 3 */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AnalyticsChartCard
              title="Alumni by Department"
              icon={Users}
              chartType={chartMode("department", "bar")}
              availableChartTypes={["bar", "pie"]}
              onChartTypeChange={(type) => updateChartMode("department", type)}
              expanded={expandedChart === "department"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "department" ? null : "department",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "department" ? "100%" : 260}
              >
                {chartMode("department", "bar") === "bar" ? (
                  <BarChart data={dataset.alumniByDepartment} layout="vertical">
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
                ) : (
                  <PieChart>
                    <Pie
                      data={dataset.alumniByDepartment}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {dataset.alumniByDepartment.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>

            <AnalyticsChartCard
              title="Graduation Cohorts"
              icon={GraduationCap}
              chartType={chartMode("graduation", "bar")}
              availableChartTypes={["bar", "line"]}
              onChartTypeChange={(type) => updateChartMode("graduation", type)}
              expanded={expandedChart === "graduation"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "graduation" ? null : "graduation",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "graduation" ? "100%" : 260}
              >
                {chartMode("graduation", "bar") === "bar" ? (
                  <BarChart data={dataset.graduationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="count" name="Alumni" fill="#e40d0a" radius={[3, 3, 0, 0]} barSize={22} />
                  </BarChart>
                ) : (
                  <LineChart data={dataset.graduationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" name="Alumni" stroke="#e40d0a" strokeWidth={2.5} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>
          </section>

          {/* Engagement trend */}
          <AnalyticsChartCard
            title="Community Engagement Trend"
            icon={Sparkles}
            chartType={chartMode("engagement", "line")}
            availableChartTypes={["line", "bar"]}
            onChartTypeChange={(type) => updateChartMode("engagement", type)}
            expanded={expandedChart === "engagement"}
            onToggleExpand={() =>
              setExpandedChart((current) =>
                current === "engagement" ? null : "engagement",
              )
            }
          >
            <ResponsiveContainer
              width="100%"
              height={expandedChart === "engagement" ? "100%" : 280}
            >
              {chartMode("engagement", "line") === "line" ? (
                <LineChart data={dataset.engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip cursor={{ stroke: "#ddd" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="posts" name="Posts" stroke="#27155f" strokeWidth={2} />
                  <Line type="monotone" dataKey="connections" name="Connections" stroke="#e40d0a" strokeWidth={2} />
                  <Line type="monotone" dataKey="mentorships" name="Mentorships" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              ) : (
                <BarChart data={dataset.engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="posts" name="Posts" fill="#27155f" />
                  <Bar dataKey="connections" name="Connections" fill="#e40d0a" />
                  <Bar dataKey="mentorships" name="Mentorships" fill="#10b981" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </AnalyticsChartCard>

          {/* Career outcomes */}
          <section className="grid grid-cols-1 gap-6">
            <AnalyticsChartCard
              title="Applications by Role"
              icon={Target}
              chartType={chartMode("applications", "bar")}
              availableChartTypes={["bar", "pie"]}
              onChartTypeChange={(type) => updateChartMode("applications", type)}
              expanded={expandedChart === "applications"}
              onToggleExpand={() =>
                setExpandedChart((current) =>
                  current === "applications" ? null : "applications",
                )
              }
            >
              <ResponsiveContainer
                width="100%"
                height={expandedChart === "applications" ? "100%" : 230}
              >
                {chartMode("applications", "bar") === "bar" ? (
                  <BarChart data={dataset.applicationsByJob} layout="vertical">
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
                ) : (
                  <PieChart>
                    <Pie
                      data={dataset.applicationsByJob}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                    >
                      {dataset.applicationsByJob.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </AnalyticsChartCard>
          </section>

      </div>
    </PageContainer>
  );
};

export default AdminAnalyticsPage;