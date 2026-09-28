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
import { getProfileApi, updateProfileApi } from "./userApi";
import { parseStudentId } from "../data";
import { computeProfileCompletion, headlineFor, locationFor } from "../lib/profileDisplay";

export async function getPublicProfileApi(userId?: string): Promise<PublicProfile> {
  const user = await getProfileApi(userId);
  // The connections count is a display detail — never block the profile on it.
  const connections = await getProfileConnectionsApi(userId).catch(() => []);
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
  try {
    const { data } = await api.get<ProfileExperience[]>(
      userId ? `/users/${userId}/experiences` : "/profile/experiences",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load experiences"));
  }
}

export async function saveProfileExperiencesApi(
  experiences: ProfileExperience[],
): Promise<User> {
  return updateProfileApi({ experiences });
}

export async function getProfileEducationApi(userId?: string): Promise<ProfileEducation[]> {
  try {
    const { data } = await api.get<ProfileEducation[]>(
      userId ? `/users/${userId}/education` : "/profile/education",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load education"));
  }
}

export async function getProfileAchievementsApi(userId?: string): Promise<ProfileAchievement[]> {
  try {
    const { data } = await api.get<ProfileAchievement[]>(
      userId ? `/users/${userId}/achievements` : "/profile/achievements",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load achievements"));
  }
}

export async function saveProfileAchievementsApi(
  achievements: ProfileAchievement[],
): Promise<User> {
  return updateProfileApi({ achievements });
}

/** Posts authored by the profile owner. */
export async function getProfilePostsApi(userId?: string): Promise<Post[]> {
  try {
    const { data } = await api.get<Post[]>(
      userId ? `/users/${userId}/posts` : "/profile/posts",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load posts"));
  }
}

/** Posts that mention/tag the profile owner. */
export async function getTaggedPostsApi(userId?: string): Promise<Post[]> {
  try {
    const { data } = await api.get<Post[]>(
      userId ? `/users/${userId}/tagged-posts` : "/profile/tagged-posts",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load tagged posts"));
  }
}

export async function getProfileActivityApi(userId?: string): Promise<ProfileActivity[]> {
  try {
    const { data } = await api.get<ProfileActivity[]>(
      userId ? `/users/${userId}/activity` : "/profile/activity",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load activity"));
  }
}

export async function getProfileSuggestionsApi(userId?: string): Promise<ProfileSuggestions> {
  try {
    const { data } = await api.get<ProfileSuggestions>(
      userId ? `/users/${userId}/suggestions` : "/profile/suggestions",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load suggestions"));
  }
}

export async function getProfileConnectionsApi(userId?: string): Promise<ProfileConnectionPresence[]> {
  try {
    const { data } = await api.get<ProfileConnectionPresence[]>(
      userId ? `/users/${userId}/connections` : "/profile/connections",
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load connections"));
  }
}

export async function getConnectionStatusApi(targetId: string): Promise<ConnectionStatus> {
  try {
    const { data } = await api.get<{ status: ConnectionStatus }>(
      `/connections/status/${targetId}`,
    );
    return data.status;
  } catch {
    return "none";
  }
}

export async function requestConnectionStatusApi(
  targetId: string,
): Promise<ConnectionStatus> {
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

/** Uploads a new profile or cover photo and returns once the backend stored it. */
export async function changeProfilePhotoApi(
  file: File,
  kind: "profile" | "cover",
): Promise<void> {
  const formData = new FormData();
  formData.append(kind === "cover" ? "cover" : "photo", file);
  // The axios instance defaults Content-Type to application/json; when that
  // header is present axios JSON-stringifies FormData instead of sending it
  // as multipart. Clearing it here lets the browser set the correct
  // multipart/form-data boundary itself.
  await api.post("/profile/media", formData, {
    headers: { "Content-Type": undefined },
  });
}
