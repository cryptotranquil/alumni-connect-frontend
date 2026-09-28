import type { User } from "../types";
import { parseStudentId } from "../data/departments";

/**
 * Presentation helpers derived from a stored user record. Kept in the app so a
 * member with an incomplete profile still renders a sensible headline,
 * location and completion score while the backend stores the raw fields.
 */

export function campusFor(user: User): string {
  if (user.registrationNumber) {
    return parseStudentId(user.registrationNumber)?.campusName ?? "";
  }
  return "";
}

export function headlineFor(user: User): string {
  if (user.headline) return user.headline;
  if (user.role === "alumni") {
    if (user.position && user.company) return `${user.position} at ${user.company}`;
    return `Alumni · Class of ${user.graduationYear ?? "—"}`;
  }
  if (user.program) return `Student · ${user.program} · ${user.department ?? "Exploits University"}`;
  return "Student at Exploits University";
}

export function locationFor(user: User): string {
  if (user.location) return user.location;
  const campus = campusFor(user);
  if (campus) return `${campus}, Malawi`;
  return "Lilongwe, Malawi";
}

export function computeProfileCompletion(user: User): number {
  const checks: boolean[] = [
    Boolean(user.name),
    Boolean(user.profilePhoto),
    Boolean(user.bio),
    Boolean(user.headline || (user.role === "alumni" && user.position) || user.program),
    Boolean(user.program || user.registrationNumber),
    Boolean(user.graduationYear),
    Boolean(user.skills && user.skills.length > 0),
    Boolean(user.experiences && user.experiences.length > 0 || (user.role === "alumni" && user.position && user.company)),
    Boolean(user.coverPhoto),
    Boolean(user.location),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
