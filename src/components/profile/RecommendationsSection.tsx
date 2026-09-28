import { useCallback, useEffect, useState } from "react";
import { Award, Loader2, MessageSquarePlus, X } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  addRecommendationApi,
  getRecommendationsApi,
  RELATION_LABELS,
  type Recommendation,
  type RecommendationRelation,
} from "../../api/recommendationApi";
import { InitialsAvatar, EmptyState } from "../shared";
import { timeAgo } from "../../lib/timeAgo";

interface RecommendationsSectionProps {
  userId?: string;
  isOwn: boolean;
}

const RELATIONS: RecommendationRelation[] = [
  "mentor",
  "manager",
  "colleague",
  "mentee",
  "peer",
];

export function RecommendationsSection({ userId, isOwn }: RecommendationsSectionProps) {
  const { user } = useAuth();
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [relation, setRelation] = useState<RecommendationRelation>("peer");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    if (!userId) return;
    try {
      setRecs(await getRecommendationsApi(userId));
    } catch {
      setError("Could not load recommendations");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const submit = async () => {
    if (!userId) return;
    if (!text.trim() || text.trim().length < 10) {
      setError("Please write at least a short recommendation.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const next = await addRecommendationApi(userId, {
        relation,
        text: text.trim(),
      });
      setRecs(next);
      setWriting(false);
      setText("");
      setRelation("peer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit recommendation");
    } finally {
      setSubmitting(false);
    }
  };

  const canWrite = !isOwn && user && user._id !== userId;

  return (
    <section className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
          <Award className="h-4 w-4 text-brand-primary" /> Recommendations
        </h3>
        {canWrite && (
          <button
            type="button"
            onClick={() => setWriting((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-brand-primary transition-colors hover:bg-brand-primary/5"
          >
            {writing ? <X className="h-3.5 w-3.5" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
            {writing ? "Cancel" : "Recommend"}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {writing && canWrite && (
        <div className="mt-3 space-y-3 rounded-xl bg-muted/40 p-4">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              How do you know this person?
            </span>
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as RecommendationRelation)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
            >
              {RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-foreground">
              Your recommendation
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Describe their skills, work ethic and impact…"
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryLight disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit recommendation
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : recs.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No recommendations yet"
            description={
              isOwn
                ? "Ask your mentors and colleagues to recommend you."
                : "Be the first to recommend them."
            }
            compact
          />
        ) : (
          recs.map((r) => (
            <div
              key={r._id}
              className="rounded-xl border border-border/70 bg-muted/20 p-4"
            >
              <div className="flex items-start gap-3">
                <InitialsAvatar name={r.from.name} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground">{r.from.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {RELATION_LABELS[r.relation]} · {r.from.position ?? r.from.role} ·{" "}
                    {timeAgo(r.createdAt)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">
                    “{r.text}”
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}