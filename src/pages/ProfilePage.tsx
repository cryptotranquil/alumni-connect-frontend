import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ShieldCheck, Mail, Phone, User } from "lucide-react";
import PageContainer from "../components/layout/PageContainer";
import { useAuth } from "../context/useAuth";
import type {
  ConnectionStatus,
  ProfileActivity,
  ProfileConnectionPresence,
  ProfileEducation,
  ProfileSuggestions,
  PublicProfile,
} from "../types/profile";
import type { User as UserType } from "../types";
import {
  getConnectionStatusApi,
  getProfileActivityApi,
  getProfileAchievementsApi,
  getProfileConnectionsApi,
  getProfileEducationApi,
  getProfilePostsApi,
  getProfileSuggestionsApi,
  getPublicProfileApi,
  getTaggedPostsApi,
  requestConnectionStatusApi,
} from "../api/profileApi";
import {
  getProfileFollowersApi,
  getFollowingIdsApi,
  isFollowingApi,
  toggleFollowApi,
} from "../api/followApi";
import {
  ProfileAbout,
  ProfileHeader,
  ProfilePostsSection,
  ProfileSidebar,
  ProfileTabs,
  ProfilePhotoModal,
  EditProfileModal,
  ChangePasswordModal,
  TaggedPostsSection,
  ActivityTimeline,
  ExperienceSection,
  EducationSection,
  SkillsSection,
  AchievementsSection,
  ConnectionsGrid,
  FollowersSection,
  RecommendationsSection,
} from "../components/profile";
import type { ProfileTabId } from "../components/profile";
import { Spinner } from "../components/shared";

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwn = !userId || (user ? userId === user._id : true);
  const targetId = userId ?? user?._id;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [suggestions, setSuggestions] = useState<ProfileSuggestions>({
    peopleYouMayKnow: [],
    similarProfessionals: [],
  });
  const [connections, setConnections] = useState<ProfileConnectionPresence[]>([]);
  const [education, setEducation] = useState<ProfileEducation[]>([]);
  const [activity, setActivity] = useState<ProfileActivity[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("none");
  const [connectPending, setConnectPending] = useState(false);
  const [followers, setFollowers] = useState<ProfileConnectionPresence[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const [postsCount, setPostsCount] = useState(0);
  const [taggedCount, setTaggedCount] = useState(0);
  const [achievementsCount, setAchievementsCount] = useState(0);

  const [activeTab, setActiveTab] = useState<ProfileTabId>("about");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoMode, setPhotoMode] = useState<"profile" | "cover" | null>(null);
  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const reload = useCallback(async () => {
    if (!targetId) return;
    setLoading(true);
    setError("");
    try {
      const [
        p,
        sugg,
        conns,
        edu,
        act,
        posts,
        tagged,
        ach,
        followersList,
        following,
      ] = await Promise.all([
        getPublicProfileApi(targetId),
        getProfileSuggestionsApi(targetId),
        getProfileConnectionsApi(targetId),
        getProfileEducationApi(targetId),
        getProfileActivityApi(targetId),
        getProfilePostsApi(targetId),
        getTaggedPostsApi(targetId),
        getProfileAchievementsApi(targetId),
        getProfileFollowersApi(targetId),
        getFollowingIdsApi(),
      ]);
      setProfile(p);
      setSuggestions(sugg);
      setConnections(conns);
      setEducation(edu);
      setActivity(act);
      setPostsCount(posts.length);
      setTaggedCount(tagged.length);
      setAchievementsCount(ach.length);
      setFollowers(followersList);
      setFollowingIds(new Set(following));
      if (!isOwn) {
        getConnectionStatusApi(targetId)
          .then(setConnectionStatus)
          .catch(() => setConnectionStatus("none"));
        setIsFollowing(await isFollowingApi(targetId));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load profile");
    } finally {
      setLoading(false);
    }
  }, [targetId, isOwn]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const onProfileChanged = (next: UserType) => {
    setProfile((prev) => (prev ? { ...prev, user: next } : prev));
    void reload();
  };

  const connect = async () => {
    if (!targetId) return;
    setConnectPending(true);
    try {
      const next = await requestConnectionStatusApi(targetId);
      setConnectionStatus(next);
    } catch {
      setConnectionStatus("none");
    } finally {
      setConnectPending(false);
    }
  };

  const onMessage = () => {
    navigate(targetId ? `/messages?user=${targetId}` : "/messages");
  };

  const handleToggleFollow = async () => {
    if (!targetId) return;
    setFollowBusy(true);
    try {
      const res = await toggleFollowApi(targetId);
      setIsFollowing(res.following);
      void reload();
    } catch { /* silent */ }
    setFollowBusy(false);
  };

  const handleAddSection = (field: "experience" | "achievements" | "skills") => {
    setActiveTab(field);
  };

  const adminView = isOwn && user?.role === "admin";

  return (
    <PageContainer title={profile ? profile.user.name : "Profile"}>
      {adminView ? (
        <AdminProfile />
      ) : loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error || !profile ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
          {error || "Profile could not be loaded."}
        </p>
      ) : (
        <div className="space-y-4">
          <ProfileHeader
            profile={profile}
            isOwn={isOwn}
            connectionStatus={connectionStatus}
            connectPending={connectPending}
            onEditProfile={() => setEditing(true)}
            onAddSection={handleAddSection}
            onChangePhoto={setPhotoMode}
            onChangePassword={() => setShowPasswordModal(true)}
            onMessage={onMessage}
            onConnect={() => void connect()}
            onToggleFollow={() => void handleToggleFollow()}
            followersCount={followers.length}
            following={isFollowing}
            followingBusy={followBusy}
          />

          {/* Tabs */}
          <ProfileTabs
            active={activeTab}
            onChange={setActiveTab}
            counts={{
              posts: postsCount,
              tagged: taggedCount,
              connections: connections.length,
              achievements: achievementsCount,
              followers: followers.length,
            }}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px]">
            {/* Main column */}
            <div className="min-w-0">
              {activeTab === "about" && (
                <>
                  <ProfileAbout
                    profile={profile}
                    isOwn={isOwn}
                    onEdit={() => setEditing(true)}
                  />
                  <RecommendationsSection
                    userId={targetId}
                    isOwn={isOwn}
                  />
                </>
              )}

              {activeTab === "posts" && (
                <ProfilePostsSection
                  userId={targetId}
                  isOwn={isOwn}
                  onActivityChanged={() => void reload()}
                />
              )}

              {activeTab === "tagged" && (
                <TaggedPostsSection
                  userId={targetId}
                  onActivityChanged={() => void reload()}
                />
              )}

              {activeTab === "activity" && (
                <ActivityTimeline activity={activity} />
              )}

              {activeTab === "experience" && (
                <ExperienceSection
                  userId={targetId}
                  isOwn={isOwn}
                  onActivityChanged={() => void reload()}
                />
              )}

              {activeTab === "education" && (
                <EducationSection education={education} />
              )}

              {activeTab === "skills" && (
                <SkillsSection
                  profile={profile}
                  isOwn={isOwn}
                  onProfileChanged={onProfileChanged}
                />
              )}

              {activeTab === "achievements" && (
                <AchievementsSection
                  userId={targetId}
                  isOwn={isOwn}
                  onActivityChanged={() => void reload()}
                />
              )}

              {activeTab === "connections" && (
                <ConnectionsGrid
                  connections={connections}
                  onMessage={onMessage}
                  onRemove={(id) =>
                    setConnections((prev) => prev.filter((c) => c._id !== id))
                  }
                />
              )}

              {activeTab === "followers" && (
                <FollowersSection
                  followers={followers}
                  followingIds={followingIds}
                  onToggleFollow={async (id) => {
                    await toggleFollowApi(id);
                    const next = await getFollowingIdsApi();
                    setFollowingIds(new Set(next));
                  }}
                />
              )}
            </div>

            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <ProfileSidebar
                profile={profile}
                suggestions={suggestions}
                onAddSection={handleAddSection}
              />
            </aside>
          </div>

          {/* Sidebar sections below content on mobile */}
          <aside className="lg:hidden">
            <ProfileSidebar
              profile={profile}
              suggestions={suggestions}
              onAddSection={handleAddSection}
            />
          </aside>
        </div>
      )}

      {profile && photoMode && (
        <ProfilePhotoModal
          mode={photoMode}
          currentPhoto={
            photoMode === "profile"
              ? profile.user.profilePhoto
              : profile.coverPhoto
          }
          userName={profile.user.name}
          onClose={() => setPhotoMode(null)}
          onSaved={() => void reload()}
        />
      )}

      {profile && editing && isOwn && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={onProfileChanged}
        />
      )}

      {isOwn && showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </PageContainer>
  );
};

// ── Admin's own simple profile ──────────────────────────────────────────────
function AdminProfile() {
  const { user } = useAuth();
  const initials = (user?.name ?? "A")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-primary">
          <span className="text-3xl font-bold text-white">{initials}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-primary/10 px-3 py-0.5 text-xs font-semibold text-brand-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Administrator
          </span>
        </div>
        <div className="w-full space-y-3 border-t pt-4 text-left text-sm text-foreground/75">
          <p className="flex items-center gap-3">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            {user?.email}
          </p>
          {user?.phone && (
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              {user.phone}
            </p>
          )}
          <p className="flex items-center gap-3">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            Role: <span className="font-medium capitalize">{user?.role}</span>
          </p>
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Admin accounts are managed by the system. Contact support to update your
        details.
      </p>
    </div>
  );
}

export default ProfilePage;