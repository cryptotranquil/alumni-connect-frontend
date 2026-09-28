import { useState } from "react";
import { Loader2, X } from "lucide-react";
import type { PublicProfile } from "../../types/profile";
import type { User } from "../../types";
import { updateProfileApi } from "../../api/userApi";
import { graduationYearOptions } from "../../lib/gradYears";
import { Select } from "../shared/Select";
import { useAuth } from "../../context/useAuth";

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30";

interface EditProfileModalProps {
  profile: PublicProfile;
  onClose: () => void;
  onSaved: (user: User) => void;
}

export function EditProfileModal({ profile, onClose, onSaved }: EditProfileModalProps) {
  const { user: authUser, updateStoredUser } = useAuth();
  const u = profile.user;
  const isStudent = profile.isStudent;

  const [form, setForm] = useState({
    name: u.name,
    headline: u.headline ?? "",
    location: u.location ?? "",
    phone: u.phone ?? "",
    website: u.website ?? "",
    university: u.university ?? "Exploits University",
    program: u.program ?? "",
    department: u.department ?? "",
    graduationYear: u.graduationYear ?? "",
    position: u.position ?? "",
    company: u.company ?? "",
    industry: u.industry ?? "",
    yearsOfExperience: u.yearsOfExperience ?? "",
    bio: u.bio ?? "",
    careerGoals: u.careerGoals ?? "",
    interests: (u.interests ?? []).join(", "),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const field = (key: keyof typeof form) =>
    (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProfileApi({
        name: form.name.trim(),
        headline: form.headline.trim() || undefined,
        location: form.location.trim() || undefined,
        phone: form.phone.trim() || undefined,
        website: form.website.trim() || undefined,
        university: form.university.trim(),
        program: form.program.trim() || undefined,
        department: form.department.trim() || undefined,
        graduationYear: form.graduationYear || undefined,
        position: form.position.trim() || undefined,
        company: form.company.trim() || undefined,
        industry: form.industry.trim() || undefined,
        yearsOfExperience: form.yearsOfExperience.trim() || undefined,
        bio: form.bio.trim() || undefined,
        careerGoals: form.careerGoals.trim() || undefined,
        interests: form.interests.split(",").map((s) => s.trim()).filter(Boolean),
      });
      // Preserve token — updateProfile response has no token.
      updateStoredUser({ ...updated, token: authUser?.token });
      onSaved(updated);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Edit profile</h3>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Personal */}
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Personal information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EditField label="Full name *">
                <input value={form.name} onChange={(e) => field("name")(e.target.value)} className={inputCls} />
              </EditField>
              <EditField label="Professional headline">
                <input value={form.headline} onChange={(e) => field("headline")(e.target.value)} className={inputCls} placeholder={isStudent ? `Student · ${u.program} · ${u.department ?? "Exploits University"}` : `${u.position ?? "Professional"} at ${u.company ?? "your company"}`} />
              </EditField>
              <EditField label="Location">
                <input value={form.location} onChange={(e) => field("location")(e.target.value)} className={inputCls} placeholder="e.g. Lilongwe, Malawi" />
              </EditField>
              <EditField label="Phone">
                <input value={form.phone} onChange={(e) => field("phone")(e.target.value)} className={inputCls} placeholder="+263 ..." />
              </EditField>
              <EditField label="Website / links">
                <input value={form.website} onChange={(e) => field("website")(e.target.value)} className={inputCls} placeholder="https://…" />
              </EditField>
              <EditField label="Email (read-only)">
                <input value={u.email} disabled className={`${inputCls} opacity-60`} />
              </EditField>
            </div>
          </section>

          {/* Professional */}
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Professional information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EditField label="Position / role">
                <input value={form.position} onChange={(e) => field("position")(e.target.value)} className={inputCls} placeholder="e.g. Software Engineer" />
              </EditField>
              <EditField label="Company">
                <input value={form.company} onChange={(e) => field("company")(e.target.value)} className={inputCls} placeholder="e.g. Old Mutual" />
              </EditField>
              <EditField label="Industry">
                <input value={form.industry} onChange={(e) => field("industry")(e.target.value)} className={inputCls} placeholder="e.g. Financial Services" />
              </EditField>
              <EditField label="Years of experience">
                <input value={form.yearsOfExperience} onChange={(e) => field("yearsOfExperience")(e.target.value)} className={inputCls} placeholder="e.g. 3" />
              </EditField>
            </div>
          </section>

          {/* Academic */}
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Academic information
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <EditField label="University">
                <input value={form.university} onChange={(e) => field("university")(e.target.value)} className={inputCls} />
              </EditField>
              <EditField label="Programme code">
                <input value={form.program} onChange={(e) => field("program")(e.target.value)} className={inputCls} placeholder="e.g. BIT" />
              </EditField>
              <EditField label="Department">
                <input value={form.department} onChange={(e) => field("department")(e.target.value)} className={inputCls} />
              </EditField>
              <EditField label={isStudent ? "Expected graduation" : "Graduation year"}>
                <Select
                  value={form.graduationYear}
                  onChange={field("graduationYear")}
                  options={graduationYearOptions().map((y) => ({ value: y, label: y }))}
                  placeholder="Select year"
                />
              </EditField>
            </div>
          </section>

          {/* Summary */}
          <section>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Summary</h4>
            <EditField label="About you">
              <textarea value={form.bio} onChange={(e) => field("bio")(e.target.value)} rows={4} className={`${inputCls} h-auto resize-none py-2`} placeholder="Tell the community about yourself…" />
            </EditField>
            {isStudent ? (
              <div className="mt-4">
                <EditField label="Career goals">
                  <textarea value={form.careerGoals} onChange={(e) => field("careerGoals")(e.target.value)} rows={2} className={`${inputCls} h-auto resize-none py-2`} placeholder="Where do you want to be after graduating?" />
                </EditField>
              </div>
            ) : null}
            <div className="mt-4">
              <EditField label="Interests (comma-separated)">
                <input value={form.interests} onChange={(e) => field("interests")(e.target.value)} className={inputCls} placeholder="Mentorship, Software, Career growth" />
              </EditField>
            </div>
          </section>

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !form.name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primaryLight disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-800">{label}</span>
      {children}
    </label>
  );
}