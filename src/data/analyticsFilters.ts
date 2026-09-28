import { CAMPUSES, ENTRY_YEARS, GRADUATION_YEARS, STUDY_MODES } from "./departments";

/** Options backing the admin analytics filter selects, derived from academic data. */
export const ANALYTICS_FILTER_OPTIONS = {
  campuses: CAMPUSES.map((c) => c.name.replace(/\s+Campus$/, "")),
  entryTypes: [...STUDY_MODES.map((m) => m.name), "Distance Learning"],
  entryYears: ENTRY_YEARS,
  graduationYears: GRADUATION_YEARS,
};
