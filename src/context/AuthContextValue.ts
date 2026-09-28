import { createContext } from "react";
import type { TwoFactorChallenge } from "../api/authApi";

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

export interface AuthContextType {
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
  resendLoginCode: (
    twoFactorToken: string,
  ) => Promise<{ codeExpiresInSeconds: number; devCode?: string }>;
  registerStudent: (data: Record<string, string>) => Promise<void>;
  registerFirstAdmin: (data: Record<string, string>) => Promise<void>;
  registerAlumni: (
    data: Record<string, string>,
  ) => Promise<{ pendingApproval: boolean }>;
  updateStoredUser: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
