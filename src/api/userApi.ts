import type { User } from "../types";
import type { ProfileAchievement, ProfileExperience } from "../types/profile";
import { api, getErrorMessage } from "./client";
import { MOCK_MODE, mockDelay, mockDelayFast, mockIdentifiableUser } from "./mockMode";
import {
  DEPARTMENTS,
  MOCK_ALUMNI,
  MOCK_EVENTS,
  MOCK_JOBS,
  MOCK_PENDING_ALUMNI,
  MOCK_PROFILES,
  MOCK_STUDENTS,
  MOCK_USERS,
  MOCK_DASHBOARD_STATS,
  getDepartmentStatsDataset,
} from "../data";

export type PeerUserSnippet = {
  _id: string;
  name: string;
  profilePhoto?: string;
  role: string;
};

// ========== DEPARTMENT TYPES ==========
export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  programs?: string[];
  programCategories?: Record<string, string[]>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStats {
  department: string;
  students: number;
  alumni: number;
  total: number;
}

export interface DashboardStats {
  users: {
    total: number;
    students: number;
    alumni: number;
    pendingAlumni: number;
    admins: number;
  };
  mentorship: {
    total: number;
    pending: number;
    completed: number;
    active: number;
  };
  jobs: {
    total: number;
    active: number;
    pending: number;
  };
  events: {
    total: number;
    upcoming: number;
  };
  charts: {
    departmentDistribution: Array<{ _id: string; count: number }>;
    monthlyRegistrations: Array<{ month: string; registrations: number }>;
    mentorshipByDepartment: Array<{ _id: string; count: number }>;
    userGrowth: Array<{ _id: { date: string; role: string }; count: number }>;
  };
}

function mockPeer(id: string): PeerUserSnippet {
  const all = [...MOCK_ALUMNI, ...MOCK_STUDENTS];
  const found = all.find((u) => u._id === id);
  return found
    ? { _id: found._id, name: found.name, profilePhoto: found.profilePhoto, role: found.role }
    : { _id: id, name: "Alumni Member", role: "alumni" };
}

function resolveCurrentUser(): User {
  const { _id } = mockIdentifiableUser();
  const found =
    MOCK_USERS.find((u) => u._id === _id) ?? MOCK_USERS.find((u) => u.role === "alumni");
  return MOCK_PROFILE_OVERRIDES.get(_id) ?? found ?? MOCK_USERS[0];
}

const MOCK_PROFILE_OVERRIDES = new Map<string, User>();
function setProfileOverride(u: User) {
  MOCK_PROFILE_OVERRIDES.set(u._id, u);
  return u;
}

function mockProfileStats(id: string) {
  const appliedJobs = MOCK_JOBS.filter((j) => j.applicants?.includes(id)).map(
    (j) => ({
      _id: j._id,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type ?? "full-time",
      status: j.status,
      createdAt: j.createdAt,
    }),
  );
  const joinedEvents = MOCK_EVENTS.filter((e) => e.participants?.includes(id)).map(
    (e) => ({
      _id: e._id,
      title: e.title,
      description: e.description,
      eventDate: e.eventDate,
      location: e.location ?? "",
      organizer: e.organizer.name,
    }),
  );
  return {
    jobsApplied: appliedJobs.length,
    appliedJobs,
    connectionsCount: 5,
    connectionsList: MOCK_ALUMNI.slice(0, 5).map((a) => ({
      _id: a._id,
      name: a.name,
      email: a.email,
      photo: a.profilePhoto ?? "",
      company: a.company,
      position: a.position,
      graduationYear: a.graduationYear,
      university: "Exploits University",
    })),
    eventsJoined: joinedEvents.length,
    eventsList: joinedEvents,
  };
}

// ========== EXISTING FUNCTIONS ==========
export async function getPeerUserApi(id: string): Promise<PeerUserSnippet> {
  if (MOCK_MODE) {
    await mockDelayFast();
    return mockPeer(id);
  }
  try {
    const { data } = await api.get<PeerUserSnippet>(`/users/peer/${id}`);
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load user"));
  }
}

export async function getAllUsersApi(): Promise<User[]> {
  if (MOCK_MODE) {
    await mockDelay();
    return MOCK_USERS;
  }
  try {
    const { data } = await api.get<
      { success: boolean; users: User[] } | User[]
    >("/users");
    return Array.isArray(data) ? data : data.users;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch users"));
  }
}

export async function getProfileApi(userId?: string): Promise<User> {
  if (MOCK_MODE) {
    await mockDelay();
    if (userId && userId !== mockIdentifiableUser()._id) {
      return (
        MOCK_USERS.find((u) => u._id === userId) ??
        MOCK_PROFILES[userId] ??
        MOCK_USERS[0]
      );
    }
    return resolveCurrentUser();
  }
  try {
    const { data } = await api.get<User>(userId ? `/users/${userId}` : "/profile");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch profile"));
  }
}

export async function updateProfileApi(data: {
  name?: string;
  phone?: string;
  graduationYear?: string;
  university?: string;
  company?: string;
  position?: string;
  skills?: string[];
  interests?: string[];
  department?: string;
  registrationNumber?: string;
  program?: string;
  bio?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  cvUrl?: string;
  headline?: string;
  location?: string;
  website?: string;
  industry?: string;
  yearsOfExperience?: string;
  careerGoals?: string;
  experiences?: ProfileExperience[];
  achievements?: ProfileAchievement[];
}): Promise<User> {
  if (MOCK_MODE) {
    await mockDelay();
    const current = resolveCurrentUser();
    const merged: User = {
      ...current,
      ...data,
      skills: data.skills ?? current.skills,
      interests: data.interests ?? current.interests,
      name: data.name ?? current.name,
    };
    return setProfileOverride(merged);
  }
  try {
    const payload = {
      ...data,
      skills: Array.isArray(data.skills) ? data.skills : [],
      interests: Array.isArray(data.interests) ? data.interests : [],
    };
    const { data: user } = await api.put<User>("/profile/update", payload);
    return user;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update profile"));
  }
}

export async function deleteUserApi(id: string): Promise<void> {
  if (MOCK_MODE) {
    await mockDelayFast();
    return;
  }
  try {
    await api.delete(`/admin/users/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to delete user"));
  }
}

export async function approveAlumniApi(id: string): Promise<void> {
  if (MOCK_MODE) {
    await mockDelayFast();
    return;
  }
  try {
    await api.put(`/admin/approve-alumni/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to approve alumni"));
  }
}

export async function changePasswordApi(payload: {
  currentPassword?: string;
  newPassword: string;
}): Promise<User> {
  if (MOCK_MODE) {
    await mockDelay();
    return resolveCurrentUser();
  }
  try {
    const { data } = await api.put<{ user: User }>(
      "/profile/password",
      payload,
    );
    if (!data.user) throw new Error("Invalid response");
    return data.user;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update password"));
  }
}

export async function inviteAdminApi(payload: {
  name: string;
  email: string;
  tempPassword: string;
}): Promise<void> {
  if (MOCK_MODE) {
    await mockDelay();
    return;
  }
  try {
    await api.post("/admin/invite-admin", payload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to send invitation"));
  }
}

export async function uploadCvApi(
  file: File,
): Promise<{ cvUrl: string; user: User }> {
  if (MOCK_MODE) {
    await mockDelay();
    const cvUrl = URL.createObjectURL(file);
    const user = await updateProfileApi({ cvUrl });
    return { cvUrl, user };
  }
  try {
    const formData = new FormData();
    formData.append("cv", file);
    const { data } = await api.post<{ cvUrl: string; user: User }>("/cv", formData, {
      headers: { "Content-Type": undefined },
    });
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to upload CV"));
  }
}

export async function uploadPhotoApi(
  file: File,
): Promise<{ profilePhoto: string; user: User }> {
  if (MOCK_MODE) {
    await mockDelay();
    const profilePhoto = URL.createObjectURL(file);
    const user = await updateProfileApi({ profilePhoto });
    return { profilePhoto, user };
  }
  try {
    const formData = new FormData();
    formData.append("photo", file);
    const { data } = await api.post<{ profilePhoto: string; user: User }>(
      "/profile/photo",
      formData,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to upload photo"));
  }
}

export async function openCvInNewTab(): Promise<void> {
  if (MOCK_MODE) {
    const user = resolveCurrentUser();
    if (user.cvUrl) {
      const win = window.open(user.cvUrl, "_blank", "noopener,noreferrer");
      if (!win) throw new Error("Popup blocked. Please allow popups for this site.");
    }
    return;
  }
  try {
    const response = await api.get("/cv", {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: "application/pdf" });
    const objectUrl = URL.createObjectURL(blob);
    const win = window.open(objectUrl, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
    if (!win)
      throw new Error("Popup blocked. Please allow popups for this site.");
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to open CV"));
  }
}

export interface ProfileStats {
  jobsApplied: number;
  appliedJobs: {
    _id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    status: string;
    createdAt: string;
  }[];
  connectionsCount: number;
  connectionsList: {
    _id: string;
    name: string;
    email: string;
    photo: string;
    company?: string;
    position?: string;
    graduationYear?: string;
    university?: string;
  }[];
  eventsJoined: number;
  eventsList: {
    _id: string;
    title: string;
    description: string;
    eventDate: string;
    location: string;
    organizer: string;
  }[];
}

export async function getProfileStatsApi(): Promise<ProfileStats> {
  if (MOCK_MODE) {
    await mockDelay();
    const { _id } = mockIdentifiableUser();
    return mockProfileStats(_id);
  }
  try {
    const { data } = await api.get<ProfileStats>("/profile/stats");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch profile stats"));
  }
}

// ========== NEW ADMIN DASHBOARD FUNCTIONS ==========
export async function getDashboardStatsApi(): Promise<DashboardStats> {
  if (MOCK_MODE) {
    await mockDelay();
    return MOCK_DASHBOARD_STATS;
  }
  try {
    const { data } = await api.get<{ success: boolean; stats: DashboardStats }>(
      "/admin/dashboard/stats",
    );
    if (!data.success) throw new Error("Failed to fetch dashboard stats");
    return data.stats;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load dashboard statistics"));
  }
}

export async function getMentorshipAnalyticsApi(): Promise<{
  analytics: Array<{ _id: string; count: number; avgMatchScore: number }>;
  topMentors: Array<{ name: string; department: string; menteeCount: number }>;
}> {
  if (MOCK_MODE) {
    await mockDelay();
    return {
      analytics: DEPARTMENTS.map((d, i) => ({
        _id: d.name,
        count: 18 + i * 6,
        avgMatchScore: 76 + i * 2,
      })),
      topMentors: MOCK_ALUMNI.slice(0, 5).map((a, i) => ({
        name: a.name,
        department: a.department ?? "Information Technology",
        menteeCount: 4 - i,
      })),
    };
  }
  try {
    const { data } = await api.get("/admin/dashboard/mentorship-analytics");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch mentorship analytics"));
  }
}

// ========== DEPARTMENT APIS ==========
export async function getDepartmentsApi(): Promise<Department[]> {
  if (MOCK_MODE) {
    await mockDelayFast();
    return DEPARTMENTS;
  }
  try {
    const { data } = await api.get<{
      success: boolean;
      departments: Department[];
    }>("/departments");
    return data.departments;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch departments"));
  }
}

export async function getAllDepartmentsApi(): Promise<Department[]> {
  if (MOCK_MODE) {
    await mockDelayFast();
    return DEPARTMENTS;
  }
  try {
    const { data } = await api.get<{
      success: boolean;
      departments: Department[];
    }>("/admin/departments/all");
    return data.departments;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch all departments"));
  }
}

export async function createDepartmentApi(payload: {
  name: string;
  code: string;
  description?: string;
}): Promise<Department> {
  if (MOCK_MODE) {
    await mockDelay();
    const now = new Date().toISOString();
    const dept: Department = {
      _id: `dep-${Date.now()}`,
      name: payload.name,
      code: payload.code,
      description: payload.description ?? "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    DEPARTMENTS.push(dept);
    return dept;
  }
  try {
    const { data } = await api.post<{
      success: boolean;
      department: Department;
    }>("/admin/departments", payload);
    if (!data.success) throw new Error("Failed to create department");
    return data.department;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to create department"));
  }
}

export async function updateDepartmentApi(
  id: string,
  payload: {
    name?: string;
    code?: string;
    description?: string;
    isActive?: boolean;
  },
): Promise<Department> {
  if (MOCK_MODE) {
    await mockDelay();
    const idx = DEPARTMENTS.findIndex((d) => d._id === id);
    if (idx < 0) throw new Error("Department not found");
    DEPARTMENTS[idx] = {
      ...DEPARTMENTS[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return DEPARTMENTS[idx];
  }
  try {
    const { data } = await api.put<{
      success: boolean;
      department: Department;
    }>(`/admin/departments/${id}`, payload);
    return data.department;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to update department"));
  }
}

export async function deleteDepartmentApi(id: string): Promise<void> {
  if (MOCK_MODE) {
    await mockDelayFast();
    const idx = DEPARTMENTS.findIndex((d) => d._id === id);
    if (idx >= 0) DEPARTMENTS.splice(idx, 1);
    return;
  }
  try {
    await api.delete(`/admin/departments/${id}`);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to delete department"));
  }
}

export async function getDepartmentStatsApi(): Promise<DepartmentStats[]> {
  if (MOCK_MODE) {
    await mockDelay();
    const dataset = getDepartmentStatsDataset();
    return dataset.map((d) => ({
      department: d._id,
      students: Math.round(d.count * 0.64),
      alumni: Math.round(d.count * 0.36),
      total: d.count,
    }));
  }
  try {
    const { data } = await api.get<{
      success: boolean;
      stats: DepartmentStats[];
    }>("/admin/departments/stats");
    return data.stats;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch department stats"));
  }
}

// ========== ADMIN USER MANAGEMENT ==========
export async function getAllUsersAdminApi(filters?: {
  role?: string;
  department?: string;
  isApproved?: boolean;
  search?: string;
}): Promise<User[]> {
  if (MOCK_MODE) {
    await mockDelay();
    let results = [...MOCK_USERS];
    if (filters?.role && filters.role !== "all") {
      results = results.filter((u) => u.role === filters.role);
    }
    if (filters?.department && filters.department !== "all") {
      results = results.filter((u) => u.department === filters.department);
    }
    if (filters?.isApproved !== undefined) {
      results = results.filter((u) => Boolean(u.isApproved) === filters.isApproved);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      results = results.filter(
        (u) =>
          u.name.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s) ||
          (u.registrationNumber ?? "").toLowerCase().includes(s),
      );
    }
    return results;
  }
  try {
    const params = new URLSearchParams();
    if (filters?.role) params.append("role", filters.role);
    if (filters?.department) params.append("department", filters.department);
    if (filters?.isApproved !== undefined)
      params.append("isApproved", String(filters.isApproved));
    if (filters?.search) params.append("search", filters.search);

    const url = `/admin/users${params.toString() ? `?${params.toString()}` : ""}`;
    const { data } = await api.get<{ success: boolean; users: User[] }>(url);
    return data.users;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch users"));
  }
}

export async function getPendingAlumniApi(): Promise<User[]> {
  if (MOCK_MODE) {
    await mockDelay();
    return MOCK_PENDING_ALUMNI;
  }
  try {
    const { data } = await api.get<{ success: boolean; alumni: User[] }>(
      "/admin/users/pending-alumni",
    );
    return data.alumni;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to fetch pending alumni"));
  }
}