import type { AuthUser, User } from "../types";
import { api, getErrorMessage } from "./client";
import { MOCK_MODE, mockDelay } from "./mockMode";
import { MOCK_USERS, createMockUser, MOCK_PENDING_ALUMNI } from "../data";

export async function getBootstrapApi(): Promise<{
  allowFirstAdminRegister: boolean;
}> {
  if (MOCK_MODE) {
    await mockDelay();
    return { allowFirstAdminRegister: false };
  }
  const { data } = await api.get<{ allowFirstAdminRegister: boolean }>(
    "/bootstrap",
  );
  return data;
}

export async function forgotPasswordApi(email: string): Promise<void> {
  if (MOCK_MODE) {
    await mockDelay();
    return;
  }
  await api.post("/forgot-password", { email });
}

export async function resetPasswordApi(
  token: string,
  newPassword: string,
): Promise<void> {
  if (MOCK_MODE) {
    await mockDelay();
    return;
  }
  await api.post("/reset-password", { token, newPassword });
}

export function getToken(): string {
  const stored = localStorage.getItem("alumniConnectUser");
  if (!stored) return "";
  try {
    return JSON.parse(stored).token || "";
  } catch {
    return "";
  }
}

/** @deprecated Prefer `api` defaults — kept for any code still importing authHeaders */
export const authHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

function resolveMockLoginUser(email: string): User {
  const match = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (match) return match;
  if (email.toLowerCase().startsWith("admin")) {
    return (
      MOCK_USERS.find((u) => u.role === "admin") ??
      MOCK_USERS[MOCK_USERS.length - 1]
    );
  }
  if (email.toLowerCase().startsWith("student")) {
    return MOCK_USERS.find((u) => u.role === "student") ?? MOCK_USERS[0];
  }
  return MOCK_USERS[0];
}

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthUser> {
  if (MOCK_MODE) {
    await mockDelay();
    if (!password || password.length < 4) {
      throw new Error("Invalid email or password. Try admin@exploits.ac.zw / admin123 or student1@exploits.ac.zw / student123.");
    }
    const user = resolveMockLoginUser(email);
    return { ...user, token: `mock-token-${user._id}` };
  }
  try {
    const { data } = await api.post<{
      user: AuthUser;
      token: string;
    }>("/login", { email, password });
    return { ...data.user, token: data.token };
  } catch (e) {
    throw new Error(getErrorMessage(e, "Login failed"));
  }
}

export interface TwoFactorChallenge {
  twoFactorRequired: true;
  twoFactorToken: string;
  destination: string;
  codeExpiresInSeconds: number;
  message?: string;
  devCode?: string;
}

/** Raw call to POST /login. Returns either a full session or a 2FA challenge — never throws for the 2FA case. */
export async function loginRawApi(
  email: string,
  password: string,
): Promise<
  | { twoFactorRequired: false; user: AuthUser; mustChangePassword: boolean }
  | TwoFactorChallenge
> {
  const { data } = await api.post<{
    user?: User;
    token?: string;
    message?: string;
    mustChangePassword?: boolean;
    twoFactorRequired?: boolean;
    twoFactorToken?: string;
    destination?: string;
    codeExpiresInSeconds?: number;
    devCode?: string;
  }>("/login", { email, password });

  if (data.twoFactorRequired) {
    return {
      twoFactorRequired: true,
      twoFactorToken: data.twoFactorToken as string,
      destination: data.destination || "",
      codeExpiresInSeconds: data.codeExpiresInSeconds || 300,
      message: data.message,
      devCode: data.devCode,
    };
  }
  if (!data.user || !data.token) {
    throw new Error(data.message || "Login failed");
  }
  return {
    twoFactorRequired: false,
    user: { ...data.user, token: data.token },
    mustChangePassword: data.mustChangePassword === true || !!data.user.mustChangePassword,
  };
}

export async function verifyTwoFactorApi(
  twoFactorToken: string,
  code: string,
): Promise<{ user: AuthUser; mustChangePassword: boolean }> {
  const { data } = await api.post<{
    user?: User;
    token?: string;
    message?: string;
    mustChangePassword?: boolean;
    attemptsLeft?: number;
  }>("/login/verify-2fa", { twoFactorToken, code });
  if (!data.user || !data.token) {
    throw new Error(data.message || "Incorrect code.");
  }
  return {
    user: { ...data.user, token: data.token },
    mustChangePassword: data.mustChangePassword === true || !!data.user.mustChangePassword,
  };
}

export async function resendTwoFactorApi(
  twoFactorToken: string,
): Promise<{ codeExpiresInSeconds: number; devCode?: string }> {
  const { data } = await api.post<{
    message?: string;
    codeExpiresInSeconds?: number;
    devCode?: string;
    retryAfterSeconds?: number;
  }>("/login/resend-2fa", { twoFactorToken });
  return {
    codeExpiresInSeconds: data.codeExpiresInSeconds || 300,
    devCode: data.devCode,
  };
}

export async function registerApi(
  data: Record<string, string>,
): Promise<AuthUser> {
  if (MOCK_MODE) {
    await mockDelay();
    const existing = MOCK_USERS.some(
      (u) => u.email.toLowerCase() === (data.email ?? "").toLowerCase(),
    );
    const alreadyPending = MOCK_PENDING_ALUMNI.some(
      (u) => u.email.toLowerCase() === (data.email ?? "").toLowerCase(),
    );
    if (existing || alreadyPending) {
      throw new Error("An account with this email already exists.");
    }
    const user = createMockUser(data);
    return { ...user, token: `mock-token-${user._id}` };
  }
  try {
    const { data: body } = await api.post<{
      user: AuthUser;
      token: string;
    }>("/register", data);
    if (!body.user || !body.token) {
      throw new Error("Registration did not return a session");
    }
    return { ...body.user, token: body.token };
  } catch (e) {
    throw new Error(getErrorMessage(e, "Registration failed"));
  }
}