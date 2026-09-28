import {
  Award,
  Briefcase,
  CalendarDays,
  Clock,
  FileText,
  Handshake,
  Heart,
  MessageCircle,
  PenSquare,
  Sparkles,
  Wrench,
} from "lucide-react";
import type { ProfileActivity, ProfileActivityType } from "../../types/profile";
import { timeAgo } from "../../lib/timeAgo";
import { InitialsAvatar } from "../shared";
import { useAuth } from "../../context/useAuth";

const ICONS: Record<ProfileActivityType, React.ReactNode> = {
  post: <PenSquare className="h-4 w-4" />,
  comment: <MessageCircle className="h-4 w-4" />,
  reaction: <Heart className="h-4 w-4" />,
  connection: <Handshake className="h-4 w-4" />,
  event: <CalendarDays className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  profile: <FileText className="h-4 w-4" />,
  skill: <Wrench className="h-4 w-4" />,
  experience: <Briefcase className="h-4 w-4" />,
  achievement: <Award className="h-4 w-4" />,
};

const TONES: Record<ProfileActivityType, string> = {
  post: "bg-brand-primary/10 text-brand-primary",
  comment: "bg-brand-primary/10 text-brand-primary",
  reaction: "bg-brand-red/10 text-brand-red",
  connection: "bg-emerald-100 text-emerald-700",
  event: "bg-amber-100 text-amber-700",
  job: "bg-brand-primary/10 text-brand-primary",
  profile: "bg-slate-100 text-slate-600",
  skill: "bg-indigo-100 text-indigo-700",
  experience: "bg-brand-primary/10 text-brand-primary",
  achievement: "bg-amber-100 text-amber-700",
};

export function ActivityTimeline({ activity }: { activity: ProfileActivity[] }) {
  const { user } = useAuth();

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed py-10 text-center">
        <Clock className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Sparkles className="h-4 w-4 text-brand-primary" />
        Recent Activity
      </h3>
      <div className="mt-4 space-y-0">
        {activity.map((item, i) => (
          <div key={item._id} className="flex gap-3">
            {/* Timeline rail */}
            <div className="flex flex-col items-center">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TONES[item.type] ?? "bg-accent text-muted-foreground"}`}
              >
                {ICONS[item.type] ?? <Clock className="h-4 w-4" />}
              </span>
              {i < activity.length - 1 && (
                <span className="w-px flex-1 bg-border" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-6">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {timeAgo(item.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <InitialsAvatar name={user?.name ?? "You"} className="h-6 w-6 text-[10px]" />
          Activity shown from your Exploits University network feed.
        </p>
      </div>
    </div>
  );
}