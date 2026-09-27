import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import PageContainer from "../../components/layout/PageContainer";
import { PageHeader } from "../../components/shared";
import { getAnalyticsDataset } from "../../data/mockAnalytics";

const AdminCareerMilestonesPage = () => {
  const { career } = getAnalyticsDataset();
  const fillRate = career.jobsPosted
    ? Math.round((career.hires / career.jobsPosted) * 100)
    : 0;

  const milestones = [
    { label: "Jobs posted", value: career.jobsPosted },
    { label: "Applications", value: career.applications },
    { label: "Saved jobs", value: career.savedJobs },
    { label: "Pending review", value: career.pendingJobs },
    { label: "Reported hires", value: career.hires },
  ];

  return (
    <PageContainer title="Career Milestones" showLogo>
      <div className="space-y-6">
        <PageHeader
          icon={BriefcaseBusiness}
          title="Career Milestones"
          subtitle="Track job activity and hiring outcomes across the community."
        />

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {milestones.map((item) => (
            <article key={item.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {item.value.toLocaleString()}
              </p>
            </article>
          ))}

          <article className="rounded-xl border bg-card p-5 shadow-sm sm:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-brand-primary" /> Roles filled
            </div>
            <p className="mt-2 text-3xl font-bold text-foreground">
              {career.hires.toLocaleString()}
              <span className="text-lg font-medium text-muted-foreground">
                {` / ${career.jobsPosted.toLocaleString()}`}
              </span>
            </p>
            <div
              className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-label="Percentage of posted roles filled"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={fillRate}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${fillRate}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {fillRate}% of posted roles reported filled
            </p>
          </article>
        </section>
      </div>
    </PageContainer>
  );
};

export default AdminCareerMilestonesPage;