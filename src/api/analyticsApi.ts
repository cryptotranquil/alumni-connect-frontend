import type { AnalyticsDataset, AnalyticsFilters } from "../types/analytics";
import { api, getErrorMessage } from "./client";

function analyticsQuery(filters: AnalyticsFilters): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.userType && filters.userType !== "all") params.set("userType", filters.userType);
  if (filters.department && filters.department !== "all") params.set("department", filters.department);
  if (filters.programme && filters.programme !== "all") params.set("programme", filters.programme);
  if (filters.entryYear && filters.entryYear !== "all") params.set("entryYear", String(filters.entryYear));
  if (filters.graduationYear && filters.graduationYear !== "all")
    params.set("graduationYear", String(filters.graduationYear));
  if (filters.campus && filters.campus !== "all") params.set("campus", filters.campus);
  if (filters.entryType && filters.entryType !== "all") params.set("entryType", filters.entryType);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Chart-ready analytics for the admin console and analytics page. */
export async function getAnalyticsDatasetApi(
  filters: AnalyticsFilters = {},
): Promise<AnalyticsDataset> {
  try {
    const { data } = await api.get<
      AnalyticsDataset | { success?: boolean; analytics?: AnalyticsDataset; dataset?: AnalyticsDataset }
    >(`/admin/analytics${analyticsQuery(filters)}`);
    if (!Array.isArray(data)) {
      const wrapped = data as {
        analytics?: AnalyticsDataset;
        dataset?: AnalyticsDataset;
      };
      const dataset = wrapped.analytics ?? wrapped.dataset;
      if (dataset) return dataset;
    }
    throw new Error("Invalid response");
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load analytics"));
  }
}
