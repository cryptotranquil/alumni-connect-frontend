import { useCallback, useEffect, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2, X } from "lucide-react";
import type { ProfileExperience } from "../../types/profile";
import {
  getProfileExperiencesApi,
  saveProfileExperiencesApi,
} from "../../api/profileApi";
import { EmptyState, Spinner } from "../shared";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Freelance", "Self-employed"];

const formatMonth = (value: string) => {
  if (!value) return "";
  const d = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(+d)) return value;
  return d.toLocaleString("en-US", { month: "short", year: "numeric" });
};

interface ExperienceSectionProps {
  userId?: string;
  isOwn: boolean;
  onActivityChanged: () => void;
}

export function ExperienceSection({ userId, isOwn, onActivityChanged }: ExperienceSectionProps) {
  const [items, setItems] = useState<ProfileExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ProfileExperience | null>(null);
  const [adding, setAdding] = useState(false);

  const reload = useCallback(() => {
    getProfileExperiencesApi(userId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const openAdd = () => {
    setEditing({
      _id: `exp-new-${Date.now()}`,
      title: "",
      company: "",
      employmentType: "Full-time",
      location: "",
      startDate: `${new Date().getFullYear()}-01`,
      current: false,
      description: "",
    });
    setAdding(true);
  };

  const close = () => {
    setEditing(null);
    setAdding(false);
  };

  const save = async (next: ProfileExperience) => {
    const exists = items.some((e) => e._id === next._id);
    const updated = exists
      ? items.map((e) => (e._id === next._id ? next : e))
      : [...items, next];
    await saveProfileExperiencesApi(updated.sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? "")));
    setItems(updated);
    close();
    onActivityChanged();
  };

  const remove = async (id: string) => {
    const updated = items.filter((e) => e._id !== id);
    await saveProfileExperiencesApi(updated);
    setItems(updated);
    onActivityChanged();
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Briefcase className="h-4 w-4 text-brand-primary" /> Experience
        </h3>
        {isOwn && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5"
          >
            <Plus className="h-3.5 w-3.5" /> Add Experience
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience added"
          description="Show where you've worked, studied or volunteered."
          compact
        />
      ) : (
        <div className="mt-4 space-y-0">
          {items.map((exp, i) => (
            <div key={exp._id} className="flex gap-3">
              <div className="flex flex-col items-center">
<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
  <Briefcase className="h-4 w-4" />
</span>
                {i < items.length - 1 && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 flex-1 pb-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{exp.title || "Untitled role"}</p>
                    <p className="text-sm text-foreground/80">
                      {exp.company}
                      {exp.employmentType ? ` · ${exp.employmentType}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatMonth(exp.startDate)} – {exp.current ? "Present" : exp.endDate ? formatMonth(exp.endDate) : "—"}
                      {exp.location ? ` · ${exp.location}` : ""}
                    </p>
                    {exp.description && (
                      <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">{exp.description}</p>
                    )}
                  </div>
                  {isOwn && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(exp);
                          setAdding(true);
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-brand-primary"
                        aria-label="Edit experience"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(exp._id)}
                        className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-brand-red"
                        aria-label="Delete experience"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(adding || editing) && isOwn && editing && (
        <ExperienceForm
          initial={editing}
          onSave={(v) => void save(v)}
          onClose={close}
        />
      )}
    </section>
  );
}

function ExperienceForm({
  initial,
  onSave,
  onClose,
}: {
  initial: ProfileExperience;
  onSave: (experience: ProfileExperience) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProfileExperience>(initial);
  const [error, setError] = useState("");
  const field = (key: keyof ProfileExperience) =>
    (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = () => {
    if (!form.title.trim() || !form.company.trim() || !form.startDate) {
      setError("Title, company and start date are required.");
      return;
    }
    onSave({
      ...form,
      current: form.current ? true : Boolean(!form.endDate),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-bold text-gray-900">
            {initial.title ? "Edit experience" : "Add experience"}
          </h4>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Job title *">
              <input value={form.title} onChange={(e) => field("title")(e.target.value)} className={inputCls} placeholder="e.g. Software Engineer" />
            </Field>
            <Field label="Company *">
              <input value={form.company} onChange={(e) => field("company")(e.target.value)} className={inputCls} placeholder="e.g. Accenture" />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Employment type">
              <select value={form.employmentType ?? "Full-time"} onChange={(e) => field("employmentType")(e.target.value)} className={inputCls}>
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <input value={form.location ?? ""} onChange={(e) => field("location")(e.target.value)} className={inputCls} placeholder="e.g. Lilongwe, Malawi" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start month *">
              <input type="month" value={form.startDate} onChange={(e) => field("startDate")(e.target.value)} className={inputCls} />
            </Field>
            <Field label="End month">
              <input type="month" value={form.endDate ?? ""} onChange={(e) => field("endDate")(e.target.value)} className={inputCls} disabled={form.current} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <input
              type="checkbox"
              checked={Boolean(form.current)}
              onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
              className="h-4 w-4 accent-[#27155f]"
            />
            I currently work here
          </label>

          <Field label="Description">
            <textarea value={form.description ?? ""} onChange={(e) => field("description")(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="What do you do?" />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 border-t pt-4">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button type="button" onClick={submit} className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primaryLight">
              Save experience
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-gray-800">{label}</span>
      {children}
    </label>
  );
}