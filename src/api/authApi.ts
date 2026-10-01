import type { AuthUser, User } from "../types";
import { api } from "./client";

export async function getBootstrapApi(): Promise<{
  allowFirstAdminRegister: boolean;
}> {
  const { data } = await api.get<{ allowFirstAdminRegister: boolean }>(
    "/bootstrap",
  );
  return data;
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post("/forgot-password", { email });
}

export async function resetPasswordApi(
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/reset-password", { token, newPassword });
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
  trustedDeviceToken?: string,
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
  }>("/login", { email, password, trustedDeviceToken });

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
    mustChangePassword:
      data.mustChangePassword === true || !!data.user.mustChangePassword,
  };
}

export async function verifyTwoFactorApi(
  twoFactorToken: string,
  code: string,
): Promise<{
  user: AuthUser;
  mustChangePassword: boolean;
  trustedDeviceToken?: string;
  trustedDeviceExpiresAt?: string;
}> {
  const { data } = await api.post<{
    user?: User;
    token?: string;
    message?: string;
    mustChangePassword?: boolean;
    twoFactorRequired?: boolean;
    attemptsLeft?: number;
    trustedDeviceToken?: string;
    trustedDeviceExpiresAt?: string;
  }>("/login/verify-2fa", { twoFactorToken, code });
  if (!data.user || !data.token) {
    throw new Error(data.message || "Incorrect code.");
  }
  return {
    user: { ...data.user, token: data.token },
    mustChangePassword:
      data.mustChangePassword === true || !!data.user.mustChangePassword,
    trustedDeviceToken: data.trustedDeviceToken,
    trustedDeviceExpiresAt: data.trustedDeviceExpiresAt,
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

export async function verifyEmailApi(
  email: string,
  code: string,
): Promise<{ message?: string }> {
  const { data } = await api.post<{ message?: string }>("/verify-email", {
    email,
    code,
  });
  return data;
}

export async function resendEmailCodeApi(email: string): Promise<void> {
  await api.post("/resend-verification", { email });
}
