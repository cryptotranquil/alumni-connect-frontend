import { useEffect, useRef, type ReactNode } from "react";
import {
  BarChart3,
  Download,
  Maximize2,
  Minimize2,
  PieChart,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type ChartType = "bar" | "line" | "pie";

interface AnalyticsChartCardProps {
  title: string;
  icon: LucideIcon;
  chartType: ChartType;
  availableChartTypes: ChartType[];
  onChartTypeChange: (chartType: ChartType) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  children: ReactNode;
}

const chartTypeIcons: Record<ChartType, LucideIcon> = {
  bar: BarChart3,
  line: TrendingUp,
  pie: PieChart,
};

const AnalyticsChartCard = ({
  title,
  icon: Icon,
  chartType,
  availableChartTypes,
  onChartTypeChange,
  expanded,
  onToggleExpand,
  children,
}: AnalyticsChartCardProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const titleId = `analytics-chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  useEffect(() => {
    if (!expanded) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onToggleExpand();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expanded, onToggleExpand]);

  const exportChart = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) return;

    const markup = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([markup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.svg`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const panel = (
    <section
      aria-labelledby={titleId}
      aria-modal={expanded || undefined}
      className={
        expanded
          ? "flex h-[80vh] max-h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl border bg-card p-5 shadow-2xl"
          : "rounded-xl border bg-card p-5 shadow-sm"
      }
      role={expanded ? "dialog" : undefined}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-foreground">
          <Icon className="h-4 w-4 shrink-0 text-brand-primary" />
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="inline-flex items-center rounded-md border border-input p-0.5"
            role="group"
            aria-label={`${title} chart type`}
          >
            {availableChartTypes.map((type) => {
              const TypeIcon = chartTypeIcons[type];
              return (
                <button
                  key={type}
                  type="button"
                  aria-label={`${type} chart`}
                  aria-pressed={chartType === type}
                  title={`${type[0].toUpperCase()}${type.slice(1)} chart`}
                  onClick={() => onChartTypeChange(type)}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${
                    chartType === type ? "bg-accent text-foreground" : ""
                  }`}
                >
                  <TypeIcon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-label={`Download ${title} as SVG`}
            title="Download graph as SVG"
            onClick={exportChart}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={expanded ? `Close expanded ${title}` : `Expand ${title}`}
            title={expanded ? "Close expanded graph" : "Expand graph"}
            onClick={onToggleExpand}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {expanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div
        ref={chartRef}
        className={`mt-4 w-full min-w-0 ${
          expanded ? "h-[60vh] min-h-[320px] max-h-[32rem]" : ""
        }`}
      >
        {children}
      </div>
    </section>
  );

  if (!expanded) return panel;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) onToggleExpand();
      }}
    >
      {panel}
    </div>
  );
};

export default AnalyticsChartCard;