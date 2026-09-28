import { Link, useSearchParams } from "react-router-dom";
import { VerifyCodeCard } from "../components/auth/VerifyCodeCard";
import { resendEmailCodeApi, verifyEmailApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import LogoHeader from "../components/layout/LogoHeader";
import Background from "../components/layout/Background";

const VerifyEmailPage = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const email = params.get("email") ?? user?.email ?? "";

  const handleVerify = async (code: string) => {
    if (!email) return false;
    try {
      await verifyEmailApi(email, code);
      return true;
    } catch {
      return false;
    }
  };

  const handleResend = async () => {
    if (!email) return;
    await resendEmailCodeApi(email);
  };

  return (
    <Background imagePath="/background.jpg">
      <div className="min-h-screen flex flex-col">
        <LogoHeader />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-md">
            <VerifyCodeCard
              title="Verify your email"
              subtitle="Confirm your email address to activate your Alumni Connect account."
              destination={email || "your registered email"}
              onVerify={handleVerify}
              onResend={handleResend}
              successTitle="Email verified successfully!"
              successDescription="Your account is active. You can now sign in and start connecting with the Exploits University community."
              successAction={
                <Link
                  to="/login"
                  className="rounded-md bg-brand-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-primaryLight"
                >
                  Go to Sign In
                </Link>
              }
              backLink={
                <Link
                  to="/login"
                  className="text-sm font-medium text-brand-primary hover:underline"
                >
                  ← Back to sign in
                </Link>
              }
            />
          </div>
        </div>
      </div>
    </Background>
  );
};

export default VerifyEmailPage;