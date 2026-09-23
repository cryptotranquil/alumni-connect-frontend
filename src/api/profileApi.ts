import type { User } from "../types";
import type {
  ConnectionStatus,
  ProfileAchievement,
  ProfileActivity,
  ProfileConnectionPresence,
  ProfileEducation,
  ProfileExperience,
  ProfileSuggestions,
  PublicProfile,
} from "../types/profile";
import type { Post } from "../types";
import { api, getErrorMessage } from "./client";
import { MOCK_MODE, mockDelay, mockDelayFast } from "./mockMode";
import { getProfileApi, updateProfileApi } from "./userApi";
import { getFeedApi } from "./postApi";
import { MOCK_POSTS } from "../data";
import {
  buildProfileAchievements,
  buildProfileConnections,
  buildProfileEducation,
  buildProfileExperiences,
  buildProfileSuggestions,
  buildTaggedPosts,
  buildProfileActivity,
  computeProfileCompletion,
  headlineFor,
  locationFor,
} from "../data";
import { parseStudentId } from "../data";

/** In-memory mock for connection requests initiated from a profile view. */
const OUTGOING_REQUESTS = new Set<string>();

const isOwn = (userId?: string) => {
  if (!userId) return true;
  try {
    const raw = localStorage.getItem("alumniConnectUser");
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?._id === userId;
  } catch {
    return false;
  }
};

export async function getPublicProfileApi(userId?: string): Promise<PublicProfile> {
  if (MOCK_MODE) {
    await mockDelayFast();
  }
  const user = await getProfileApi(userId);
  const connections = buildProfileConnections(user);
  return {
    user,
    isStudent: user.role === "student",
    headline: headlineFor(user),
    location: locationFor(user),
    coverPhoto: user.coverPhoto ?? "",
    programme: user.program ?? (user.registrationNumber ? "BIT" : ""),
    department: user.department ?? "",
    campus: user.registrationNumber
      ? parseStudentId(user.registrationNumber)?.campusName ?? ""
      : "",
    graduationYear: user.graduationYear ?? "",
    profileCompletion: computeProfileCompletion(user),
    connectionsCount: connections.length,
  };
}

export async function getProfileExperiencesApi(userId?: string): Promise<ProfileExperience[]> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<ProfileExperience[]>(
        userId ? `/users/${userId}/experiences` : "/profile/experiences",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load experiences"));
    }
  }
  const user = await getProfileApi(userId);
  return user.experiences && user.experiences.length > 0
    ? user.experiences
    : buildProfileExperiences(user);
}

export async function saveProfileExperiencesApi(
  experiences: ProfileExperience[],
): Promise<User> {
  return updateProfileApi({ experiences });
}

export async function getProfileEducationApi(userId?: string): Promise<ProfileEducation[]> {
  const user = await getProfileApi(userId);
  return buildProfileEducation(user);
}

export async function getProfileAchievementsApi(userId?: string): Promise<ProfileAchievement[]> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<ProfileAchievement[]>(
        userId ? `/users/${userId}/achievements` : "/profile/achievements",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load achievements"));
    }
  }
  const user = await getProfileApi(userId);
  return user.achievements && user.achievements.length > 0
    ? user.achievements
    : buildProfileAchievements(user);
}

export async function saveProfileAchievementsApi(
  achievements: ProfileAchievement[],
): Promise<User> {
  return updateProfileApi({ achievements });
}

/** Posts authored by the profile owner (feed filtered by author). */
export async function getProfilePostsApi(userId?: string): Promise<Post[]> {
  const feed = await getFeedApi();
  if (isOwn(userId)) return feed;
  return feed.filter((p) => p.author._id === userId);
}

/**
 * Posts that mention/tag the profile owner.
 * Seeded tagged posts + anything composed with @Name in the current session
 * (the composer embeds mentions as "@Name" inside post text).
 */
export async function getTaggedPostsApi(userId?: string): Promise<Post[]> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<Post[]>(
        userId ? `/users/${userId}/tagged-posts` : "/profile/tagged-posts",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load tagged posts"));
    }
  }
  await mockDelayFast();
  const user = await getProfileApi(userId);
  const seeded = buildTaggedPosts(user);
  const surfaced = MOCK_POSTS.filter((p) =>
    p.text.includes(`@${user.name}`),
  );
  const seen = new Set(seeded.map((p) => p._id));
  return [...seeded, ...surfaced.filter((p) => !seen.has(p._id))];
}

export async function getProfileActivityApi(userId?: string): Promise<ProfileActivity[]> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<ProfileActivity[]>(
        userId ? `/users/${userId}/activity` : "/profile/activity",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load activity"));
    }
  }
  const user = await getProfileApi(userId);
  return buildProfileActivity(user);
}

export async function getProfileSuggestionsApi(userId?: string): Promise<ProfileSuggestions> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<ProfileSuggestions>(
        userId ? `/users/${userId}/suggestions` : "/profile/suggestions",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load suggestions"));
    }
  }
  const user = await getProfileApi(userId);
  return buildProfileSuggestions(user);
}

export async function getProfileConnectionsApi(userId?: string): Promise<ProfileConnectionPresence[]> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<ProfileConnectionPresence[]>(
        userId ? `/users/${userId}/connections` : "/profile/connections",
      );
      return data;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Failed to load connections"));
    }
  }
  const user = await getProfileApi(userId);
  return buildProfileConnections(user);
}

export async function getConnectionStatusApi(targetId: string): Promise<ConnectionStatus> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.get<{ status: ConnectionStatus }>(
        `/connections/status/${targetId}`,
      );
      return data.status;
    } catch {
      return "none";
    }
  }
  await mockDelayFast();
  if (OUTGOING_REQUESTS.has(targetId)) return "pending";
  // Demos: treat the seeded mentor matches as accepted.
  const seededAccepted = [
    "alu-1",
    "alu-2",
    "alu-3",
    "std-1",
    "std-2",
    "std-3",
  ];
  return seededAccepted.includes(targetId) ? "accepted" : "none";
}

export async function requestConnectionStatusApi(
  targetId: string,
): Promise<ConnectionStatus> {
  if (!MOCK_MODE) {
    try {
      const { data } = await api.post<{ status: ConnectionStatus }>(
        "/connections/request",
        { targetId },
      );
      return data.status;
    } catch (e) {
      throw new Error(getErrorMessage(e, "Could not send request"));
    }
  }
  await mockDelay();
  OUTGOING_REQUESTS.add(targetId);
  return "pending";
}

/** Profile photo mock upload — returns a usable URL (object URL in mock mode). */
export async function changeProfilePhotoApi(
  file: File,
  kind: "profile" | "cover",
): Promise<void> {
  if (!MOCK_MODE) {
    const formData = new FormData();
    formData.append(kind === "cover" ? "cover" : "photo", file);
    // The axios instance defaults Content-Type to application/json; when that
    // header is present axios JSON-stringifies FormData instead of sending it
    // as multipart. Clearing it here lets the browser set the correct
    // multipart/form-data boundary itself.
    await api.post("/profile/media", formData, {
      headers: { "Content-Type": undefined },
    });
    return;
  }
  await mockDelay();
  const url = URL.createObjectURL(file);
  await updateProfileApi(
    kind === "cover" ? { coverPhoto: url } : { profilePhoto: url },
  );
}