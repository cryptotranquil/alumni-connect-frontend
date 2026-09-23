import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { VerifyCodeCard } from "../components/auth/VerifyCodeCard";
import { useAuth } from "../context/AuthContext";
import LogoHeader from "../components/layout/LogoHeader";
import Background from "../components/layout/Background";

interface TwoFactorLocationState {
  twoFactorToken?: string;
  destination?: string;
  codeExpiresInSeconds?: number;
  devCode?: string;
  redirectTo?: string;
  requireAdmin?: boolean;
}

const TwoFactorPage = () => {
  const { completeLogin, resendLoginCode, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as TwoFactorLocationState;
  const [token, setToken] = useState(state.twoFactorToken);
  const [devCode, setDevCode] = useState(state.devCode);

  // Someone landed here directly (refresh, bookmark) without going through
  // login first, so there's no in-progress 2FA challenge to verify.
  if (!token) {
    return (
      <Background imagePath="/background.jpg">
        <div className="min-h-screen flex flex-col">
          <LogoHeader />
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                No sign-in in progress
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Please sign in again to receive a new verification code.
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block rounded-md bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryLight"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </Background>
    );
  }

  const handleVerify = async (code: string) => {
    try {
      const { user } = await completeLogin(token, code);
      if (state.requireAdmin && user.role !== "admin") {
        // Correct code, wrong portal — don't leave an admin-portal session
        // sitting around for a non-admin account.
        logout();
        navigate("/admin/login", { replace: true });
        return true;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSuccessContinue = () => {
    navigate(state.redirectTo || "/dashboard", { replace: true });
  };

  const handleResend = async () => {
    const result = await resendLoginCode(token);
    setDevCode(result.devCode);
    // Backend issues a fresh token-bound code against the same
    // twoFactorToken, so there's nothing else to update here.
    setToken(token);
  };

  return (
    <Background imagePath="/background.jpg">
      <div className="min-h-screen flex flex-col">
        <LogoHeader />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <VerifyCodeCard
              title="Two-step verification"
              subtitle="Enter the 6-digit code we emailed you to finish signing in."
              destination={state.destination || "your email"}
              onVerify={handleVerify}
              onResend={handleResend}
              verifyLabel="Verify & Sign In"
              successTitle="Identity verified"
              successDescription="You're all set. Continuing now…"
              successAction={
                <button
                  type="button"
                  onClick={handleSuccessContinue}
                  className="rounded-md bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryLight"
                >
                  Continue
                </button>
              }
              backLink={
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  ← Back to sign in
                </Link>
              }
              demoHint={devCode ? `Dev mode — code is ${devCode}` : undefined}
            />
          </div>
        </div>
      </div>
    </Background>
  );
};

export default TwoFactorPage;
