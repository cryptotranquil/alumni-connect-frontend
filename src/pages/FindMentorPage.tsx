import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Compass,
  Handshake,
  HeartHandshake,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import { useAuth } from "../context/useAuth";
import {
  getMenteeMatchesApi,
  getMentorMatchesApi,
  getMentorshipStateApi,
  offerMentorshipApi,
  requestMentorshipApi,
  type MenteeMatch,
  type MentorMatch,
} from "../api/mentorshipApi";
import { InitialsAvatar, Spinner } from "../components/shared";

const FindMentorPage = () => {
  const { user } = useAuth();
  const isAlumni = user?.role === "alumni";

  const [mentors, setMentors] = useState<MentorMatch[]>([]);
  const [mentees, setMentees] = useState<MenteeMatch[]>([]);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [offered, setOffered] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const state = await getMentorshipStateApi();
      setRequested(new Set(state.requestSent ?? []));
      setOffered(new Set(state.offered ?? []));
      if (isAlumni) {
        setMentees(await getMenteeMatchesApi());
      } else {
        setMentors(await getMentorMatchesApi());
      }
    } catch {
      setError("Could not load mentorship matches");
    } finally {
      setLoading(false);
    }
  }, [isAlumni]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const request = async (mentorId: string) => {
    setBusyId(mentorId);
    try {
      await requestMentorshipApi(mentorId);
      setRequested((prev) => new Set(prev).add(mentorId));
    } catch {
      setError("Could not send request");
    }
    setBusyId(null);
  };

  const offer = async (studentId: string) => {
    setBusyId(studentId);
    try {
      await offerMentorshipApi(studentId);
      setOffered((prev) => new Set(prev).add(studentId));
    } catch {
      setError("Could not send offer");
    }
    setBusyId(null);
  };

  return (
    <PageContainer title="Mentorship">
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primaryLight p-6 text-white shadow-sm">
        <h2 className="text-2xl font-bold">Find a mentor, grow together</h2>
        <p className="mt-1 text-sm text-white/80">
          We match students with alumni by department, programme and skills.
          {isAlumni
            ? " As an alumnus, you can also offer mentorship to students."
            : " Reach out to an alumni mentor — or browse below."}
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : isAlumni ? (
        <AlumniMentorship
          mentees={mentees}
          offered={offered}
          busyId={busyId}
          onOffer={offer}
        />
      ) : (
        <StudentMentorship
          mentors={mentors}
          requested={requested}
          busyId={busyId}
          onRequest={request}
        />
      )}
    </PageContainer>
  );
};

function MatchScore({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-emerald-100 text-emerald-700"
      : score >= 55
        ? "bg-amber-100 text-amber-700"
        : "bg-blue-100 text-brand-primary";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}
      title="Match score"
    >
      <TrendingUp className="h-3 w-3" /> {score}% match
    </span>
  );
}

function StudentMentorship({
  mentors,
  requested,
  busyId,
  onRequest,
}: {
  mentors: MentorMatch[];
  requested: Set<string>;
  busyId: string | null;
  onRequest: (id: string) => Promise<void>;
}) {
  if (mentors.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
        <Compass className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No strong mentor matches yet — complete your profile to improve matches.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Recommended alumni mentors
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mentors.map(({ mentor, matchScore, matchReasons, availability, responseRate }) => {
          const sent = requested.has(mentor._id);
          return (
            <div
              key={mentor._id}
              className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <Link to={`/profile/${mentor._id}`} className="shrink-0">
                  <InitialsAvatar name={mentor.name} className="h-14 w-14 text-lg" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${mentor._id}`}>
                    <p className="truncate text-sm font-bold text-foreground hover:text-brand-primary">
                      {mentor.name}
                    </p>
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {mentor.position} at {mentor.company}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {mentor.program} · Class of {mentor.graduationYear} · {responseRate} response
                  </p>
                </div>
                <MatchScore score={matchScore} />
              </div>

              <ul className="mt-3 space-y-1">
                {matchReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand-primary" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-2 border-t pt-3">
                <button
                  type="button"
                  disabled={sent || busyId === mentor._id}
                  onClick={() => void onRequest(mentor._id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                    sent
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-brand-primary text-white hover:bg-brand-primaryLight disabled:opacity-60"
                  }`}
                >
                  {busyId === mentor._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : sent ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Handshake className="h-3.5 w-3.5" />
                  )}
                  {sent ? "Request sent" : "Request mentorship"}
                </button>
                <Link
                  to={`/profile/${mentor._id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  View profile
                </Link>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {availability
                  ? "▸ Currently open to taking mentees"
                  : "▸ Occasional availability"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AlumniMentorship({
  mentees,
  offered,
  busyId,
  onOffer,
}: {
  mentees: MenteeMatch[];
  offered: Set<string>;
  busyId: string | null;
  onOffer: (id: string) => Promise<void>;
}) {
  if (mentees.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed py-16 text-center">
        <HeartHandshake className="h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No students matching your expertise yet.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Students who match your expertise
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mentees.map(({ student, matchScore, interests, matchedOn }) => {
          const done = offered.has(student._id);
          return (
            <div
              key={student._id}
              className="rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <Link to={`/profile/${student._id}`} className="shrink-0">
                  <InitialsAvatar name={student.name} className="h-14 w-14 text-lg" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/profile/${student._id}`}>
                    <p className="truncate text-sm font-bold text-foreground hover:text-brand-primary">
                      {student.name}
                    </p>
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    Student · {student.program} · Class of {student.graduationYear}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {interests.join(" · ")}
                  </p>
                </div>
                <MatchScore score={matchScore} />
              </div>

              <ul className="mt-3 space-y-1">
                {matchedOn.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-brand-primary" />
                    {r}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center gap-2 border-t pt-3">
                <button
                  type="button"
                  disabled={done || busyId === student._id}
                  onClick={() => void onOffer(student._id)}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed ${
                    done
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-brand-primary text-white hover:bg-brand-primaryLight disabled:opacity-60"
                  }`}
                >
                  {busyId === student._id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : done ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <HeartHandshake className="h-3.5 w-3.5" />
                  )}
                  {done ? "Offer sent" : "Offer to mentor"}
                </button>
                <Link
                  to={`/profile/${student._id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                >
                  View profile
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default FindMentorPage;