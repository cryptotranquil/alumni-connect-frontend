import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { api, getErrorMessage } from "../api/client";
import { MOCK_MODE } from "../api/mockMode";
import {
  loginApi,
  registerApi,
  loginRawApi,
  verifyTwoFactorApi,
  resendTwoFactorApi,
  type TwoFactorChallenge,
} from "../api/authApi";

export type UserRole = "student" | "alumni" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  graduationYear?: string;
  university?: string;
  department?: string;
  program?: string;
  registrationNumber?: string;
  company?: string;
  position?: string;
  profilePhoto?: string;
  skills?: string[];
  bio?: string;
  cvUrl?: string;
  isApproved?: boolean;
  mustChangePassword?: boolean;
  token?: string;
}

const STORAGE_KEY = "alumniConnectUser";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<
    | { twoFactorRequired: false; mustChangePassword: boolean; user: User }
    | TwoFactorChallenge
  >;
  completeLogin: (
    twoFactorToken: string,
    code: string,
  ) => Promise<{ mustChangePassword: boolean; user: User }>;
  resendLoginCode: (twoFactorToken: string) => Promise<{ codeExpiresInSeconds: number; devCode?: string }>;
  registerStudent: (data: Record<string, string>) => Promise<void>;
  registerFirstAdmin: (data: Record<string, string>) => Promise<void>;
  registerAlumni: (
    data: Record<string, string>,
  ) => Promise<{ pendingApproval: boolean }>;
  updateStoredUser: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    if (MOCK_MODE) {
      // No backend to validate against — restore the session as-is.
      setUser(parsed);
      setLoading(false);
      return;
    }

    api
      .get("/profile", {
        headers: { Authorization: `Bearer ${parsed?.token}` },
      })
      .then(() => {
        setUser(parsed);
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
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
    if (MOCK_MODE) {
      const auth = await loginApi(email, password);
      const mustChangePassword = auth.mustChangePassword === true;
      persist({ ...auth, mustChangePassword });
      return { twoFactorRequired: false as const, mustChangePassword, user: auth };
    }
    try {
      const result = await loginRawApi(email, password);
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
      const { user: authUser, mustChangePassword } = await verifyTwoFactorApi(
        twoFactorToken,
        code,
      );
      persist({ ...authUser, token: authUser.token, mustChangePassword });
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
    if (MOCK_MODE) {
      const auth = await registerApi({ ...data, role: "student" });
      persist({ ...auth, mustChangePassword: false });
      return;
    }
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
    if (MOCK_MODE) {
      const auth = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        role: "admin",
      });
      persist({ ...auth, mustChangePassword: false });
      return;
    }
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
    if (MOCK_MODE) {
      const auth = await registerApi({ ...data, role: "alumni" });
      persist({ ...auth, mustChangePassword: false });
      // Demo: alumni are approved instantly so they can explore the app.
      return { pendingApproval: false };
    }
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

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export default AuthContext;