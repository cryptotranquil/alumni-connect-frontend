import {
    BarChart3,
    GraduationCap,
    Users,
    RotateCcw,
    Layers,
} from "lucide-react";
import { type AnalyticsFilters } from "../../data/mockAnalytics";
import { DEPARTMENTS, GRADUATION_YEARS } from "../../data/departments";
import { Select } from "../shared";

interface AdminSidebarProps {
    filters: AnalyticsFilters;
    onFiltersChange: (filters: AnalyticsFilters) => void;
    onApply: () => void;
}

export const AdminSidebar = ({
    filters,
    onFiltersChange,
    onApply,
}: AdminSidebarProps) => {
    const deptOptions = DEPARTMENTS.map((d) => ({ value: d.name, label: d.name }));
    const yearOptions = GRADUATION_YEARS.map((y) => ({
        value: String(y),
        label: String(y),
    }));

    const campusOptions = [
        { value: "Blantyre", label: "Blantyre" },
        { value: "Lilongwe", label: "Lilongwe" },
        { value: "Mzuzu", label: "Mzuzu" },
    ];

    return (
        <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-primary" />
                <h2 className="text-sm font-semibold text-foreground">Analytics Filters</h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                <div className="min-w-0">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> User Type
                    </label>
                    <Select
                        placeholder="All user types"
                        value={filters.userType ?? ""}
                        onChange={(v) =>
                            onFiltersChange({
                                ...filters,
                                userType: (v || "all") as AnalyticsFilters["userType"],
                            })
                        }
                        options={[
                            { value: "all", label: "All user types" },
                            { value: "student", label: "Students" },
                            { value: "alumni", label: "Alumni" },
                        ]}
                    />
                </div>

                <div className="min-w-0">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Layers className="h-3.5 w-3.5" /> Department
                    </label>
                    <Select
                        placeholder="All departments"
                        value={filters.department ?? ""}
                        onChange={(v) =>
                            onFiltersChange({ ...filters, department: v || undefined })
                        }
                        options={[
                            { value: "all", label: "All departments" },
                            ...deptOptions,
                        ]}
                    />
                </div>

                <div className="min-w-0">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <GraduationCap className="h-3.5 w-3.5" /> Graduation Year
                    </label>
                    <Select
                        placeholder="All years"
                        value={
                            filters.graduationYear && filters.graduationYear !== "all"
                                ? String(filters.graduationYear)
                                : ""
                        }
                        onChange={(v) =>
                            onFiltersChange({
                                ...filters,
                                graduationYear:
                                    v && v !== "all" ? Number(v) : ("all" as const),
                            })
                        }
                        options={[{ value: "all", label: "All years" }, ...yearOptions]}
                    />
                </div>

                <div className="min-w-0">
                    <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                        Campus Location
                    </label>
                    <Select
                        placeholder="All campuses"
                        value={filters.campus ?? ""}
                        onChange={(v) =>
                            onFiltersChange({ ...filters, campus: v || undefined })
                        }
                        options={[
                            { value: "all", label: "All campuses" },
                            ...campusOptions,
                        ]}
                    />
                </div>

                <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
                    <button
                        type="button"
                        onClick={onApply}
                        className="min-h-10 flex-1 rounded-lg bg-brand-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryDark"
                    >
                        Apply Filters
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onFiltersChange({});
                            onApply();
                        }}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Reset filters"
                        title="Reset filters"
                    >
                        <RotateCcw className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </section>
    );
};