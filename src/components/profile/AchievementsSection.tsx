import { useState } from "react";
import { Award, Plus, Trophy, X } from "lucide-react";
import type { ProfileAchievement } from "../../types/profile";
import {
  getProfileAchievementsApi,
  saveProfileAchievementsApi,
} from "../../api/profileApi";
import { useCallback, useEffect } from "react";
import { EmptyState, Spinner } from "../shared";

const ICONS: Record<string, React.ReactNode> = {
  award: <Award className="h-5 w-5" />,
  certificate: <Trophy className="h-5 w-5" />,
  trophy: <Trophy className="h-5 w-5" />,
  handshake: <Award className="h-5 w-5" />,
  users: <Award className="h-5 w-5" />,
};

interface AchievementsSectionProps {
  userId?: string;
  isOwn: boolean;
  onActivityChanged: () => void;
}

export function AchievementsSection({ userId, isOwn, onActivityChanged }: AchievementsSectionProps) {
  const [items, setItems] = useState<ProfileAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", organization: "" });

  const reload = useCallback(() => {
    getProfileAchievementsApi(userId)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = async () => {
    if (!form.title.trim()) return;
    const next: ProfileAchievement = {
      _id: `ach-new-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      date: form.date || undefined,
      organization: form.organization.trim() || undefined,
      icon: "award",
    };
    const updated = [next, ...items];
    await saveProfileAchievementsApi(updated);
    setItems(updated);
    setAdding(false);
    setForm({ title: "", description: "", date: "", organization: "" });
    onActivityChanged();
  };

  const remove = async (id: string) => {
    const updated = items.filter((a) => a._id !== id);
    await saveProfileAchievementsApi(updated);
    setItems(updated);
    onActivityChanged();
  };

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Award className="h-4 w-4 text-brand-primary" /> Achievements
        </h3>
        {isOwn && (
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5"
          >
            {adding ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {adding ? "Close" : "Add Achievement"}
          </button>
        )}
      </div>

      {adding && isOwn && (
        <div className="mt-4 space-y-3 rounded-xl bg-muted/40 p-4">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Achievement title *"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-primary/50"
          />
          <input
            value={form.organization}
            onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
            placeholder="Issuing organisation"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-primary/50"
          />
          <input
            type="month"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            placeholder="Date"
            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-primary/50"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short description"
            rows={2}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand-primary/50"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void save()}
              disabled={!form.title.trim()}
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primaryLight disabled:opacity-50"
            >
              Save achievement
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Award} title="No achievements yet" description="Awards, certifications and milestones." compact />
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="group relative rounded-xl border bg-accent/40 p-4 transition-colors hover:bg-accent/70">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  {ICONS[item.icon ?? "award"] ?? <Award className="h-5 w-5" />}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{item.title}</p>
                  {(item.organization || item.date) && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[item.organization, item.date ? new Date(`${item.date}-01`).toLocaleString("en-US", { month: "short", year: "numeric" }) : ""]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {item.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/75">{item.description}</p>
                  )}
                </div>
              </div>
              {isOwn && (
                <button
                  type="button"
                  onClick={() => void remove(item._id)}
                  className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-brand-red group-hover:opacity-100"
                  aria-label="Remove achievement"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}