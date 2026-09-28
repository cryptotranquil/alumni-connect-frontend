import type { DirectoryUser } from "../types";
import { api, getErrorMessage } from "./client";

/**
 * Mentorship matching: students are matched to alumni mentors, and alumni are
 * matched to mentees. Scores and reasons come from the backend.
 */

export interface MentorMatch {
  mentor: DirectoryUser;
  matchScore: number;
  matchReasons: string[];
  availability: boolean;
  responseRate: string;
}

export interface MenteeMatch {
  student: DirectoryUser;
  matchScore: number;
  interests: string[];
  matchedOn: string[];
}

export interface MentorshipEndorsed {
  requestSent?: string[];
  offered?: string[];
}

export async function getMentorMatchesApi(): Promise<MentorMatch[]> {
  try {
    const { data } = await api.get<MentorMatch[]>("/mentors/matches");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load mentor matches"));
  }
}

export async function getMenteeMatchesApi(): Promise<MenteeMatch[]> {
  try {
    const { data } = await api.get<MenteeMatch[]>("/mentors/mentees");
    return data;
  } catch (e) {
    throw new Error(getErrorMessage(e, "Failed to load mentee matches"));
  }
}

export async function requestMentorshipApi(mentorId: string): Promise<void> {
  try {
    await api.post("/mentors/request", { mentorId });
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not send mentorship request"));
  }
}

export async function offerMentorshipApi(studentId: string): Promise<void> {
  try {
    await api.post("/mentors/offer", { studentId });
  } catch (e) {
    throw new Error(getErrorMessage(e, "Could not send offer"));
  }
}

/** Which mentors this student asked / which mentees this alumni offered. */
export async function getMentorshipStateApi(): Promise<MentorshipEndorsed> {
  try {
    const { data } = await api.get<{ state?: MentorshipEndorsed } & MentorshipEndorsed>(
      "/mentors/state",
    );
    return data.state ?? data;
  } catch {
    return { requestSent: [], offered: [] };
  }
}
