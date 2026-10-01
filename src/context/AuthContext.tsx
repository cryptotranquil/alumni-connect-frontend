import { useState, useEffect, type ReactNode } from "react";
import { api, getErrorMessage } from "../api/client";
import {
  loginRawApi,
  verifyTwoFactorApi,
  resendTwoFactorApi,
} from "../api/authApi";
import { AuthContext, type User } from "./AuthContextValue";

export type { AuthContextType, User, UserRole } from "./AuthContextValue";

const STORAGE_KEY = "alumniConnectUser";
const TRUSTED_KEY = "alumniConnectTrustedDevice";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(STORAGE_KEY);
    localStorage.removeItem("ac_user");

    if (!stored) {
      setLoading(false);
      return;
    }

    let parsed: User | null = null;
    try {
      parsed = JSON.parse(stored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    api
      .get("/profile", {
        headers: { Authorization: `Bearer ${parsed?.token}` },
      })
      .then(() => {
        if (!cancelled) setUser(parsed);
      })
      .catch(() => {
        if (cancelled) return;

        const current = localStorage.getItem(STORAGE_KEY);
        if (!current) return;
        try {
          const cur = JSON.parse(current);
          if (cur?.token === parsed?.token) {
            localStorage.removeItem(STORAGE_KEY);
            setUser(null);
          }
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persist = (u: User) => {
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  };

  const updateStoredUser = (u: User) => {
    const token = user?.token ?? u.token;
    persist({ ...u, token: token || u.token });
  };

  const login = async (email: string, password: string) => {
    try {
      const trusted = localStorage.getItem(TRUSTED_KEY) || undefined;
      const result = await loginRawApi(email, password, trusted);
      if (result.twoFactorRequired) {
        return result;
      }
      persist({
        ...result.user,
        token: result.user.token,
        mustChangePassword: result.mustChangePassword,
      });
      return {
        twoFactorRequired: false as const,
        mustChangePassword: result.mustChangePassword,
        user: result.user,
      };
    } catch (e) {
      throw new Error(getErrorMessage(e, "Login failed"));
    }
  };

  /** Submit the emailed 6-digit code for a login started by `login()`. */
  const completeLogin = async (twoFactorToken: string, code: string) => {
    try {
      const {
        user: authUser,
        mustChangePassword,
        trustedDeviceToken,
      } = await verifyTwoFactorApi(twoFactorToken, code);
      persist({ ...authUser, token: authUser.token, mustChangePassword });
      if (trustedDeviceToken) {
        localStorage.setItem(TRUSTED_KEY, trustedDeviceToken);
      }
      return { mustChangePassword, user: authUser };
    } catch (e) {
      throw new Error(getErrorMessage(e, "Incorrect code."));
    }
  };

  /** Ask the backend to email a fresh 6-digit code for an in-progress login. */
  const resendLoginCode = async (twoFactorToken: string) => {
    try {
      return await resendTwoFactorApi(twoFactorToken);
    } catch (e) {
      throw new Error(getErrorMessage(e, "Could not resend the code."));
    }
  };

  const registerStudent = async (data: Record<string, string>) => {
    try {
      const { data: body } = await api.post<{
        user: User;
        token: string;
        message?: string;
      }>("/register", { ...data, role: "student" });
      if (!body.token || !body.user)
        throw new Error(body.message || "Registration failed");
      persist({ ...body.user, token: body.token, mustChangePassword: false });
    } catch (e) {
      throw new Error(getErrorMessage(e, "Registration failed"));
    }
  };

  const registerFirstAdmin = async (data: Record<string, string>) => {
    try {
      const { data: body } = await api.post<{
        user: User;
        token: string;
        message?: string;
      }>("/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: "admin",
      });
      if (!body.token || !body.user)
        throw new Error(body.message || "Registration failed");
      persist({ ...body.user, token: body.token, mustChangePassword: false });
    } catch (e) {
      throw new Error(getErrorMessage(e, "Registration failed"));
    }
  };

  const registerAlumni = async (data: Record<string, string>) => {
    try {
      const { data: body } = await api.post<{
        user: User;
        token: string | null;
        pendingApproval?: boolean;
        message?: string;
      }>("/register", { ...data, role: "alumni" });
      if (body.pendingApproval) return { pendingApproval: true };
      if (body.token && body.user)
        persist({ ...body.user, token: body.token, mustChangePassword: false });
      return { pendingApproval: false };
    } catch (e) {
      throw new Error(getErrorMessage(e, "Registration failed"));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        completeLogin,
        resendLoginCode,
        registerStudent,
        registerFirstAdmin,
        registerAlumni,
        updateStoredUser,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
