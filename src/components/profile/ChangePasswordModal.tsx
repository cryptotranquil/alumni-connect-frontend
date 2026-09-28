import { useState } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, X } from "lucide-react";
import { changePasswordApi } from "../../api/userApi";
import { useAuth } from "../../context/useAuth";

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background pl-9 pr-10 text-sm outline-none transition-colors focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const { user, updateStoredUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordOk = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirm && passwordOk;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (!passwordOk) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    try {
      const updated = await changePasswordApi({
        currentPassword,
        newPassword,
      });
      updateStoredUser({ ...updated, token: user?.token });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">Change password</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 p-6">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-sm font-semibold text-emerald-700">
                Password updated successfully!
              </p>
            </div>
          ) : (
            <>
              {/* Current password */}
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Current password
                </span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className={inputCls}
                  />
                </div>
              </label>

              {/* New password */}
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  New password
                </span>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={inputCls}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {newPassword && (
                  <p
                    className={`mt-1 text-xs ${passwordOk ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {passwordOk
                      ? "Strong enough."
                      : "Password must be at least 8 characters."}
                  </p>
                )}
              </label>

              {/* Confirm password */}
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-gray-800">
                  Confirm new password
                </span>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
                  />
                </div>
                {confirm.length > 0 && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match.
                  </p>
                )}
              </label>

              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !currentPassword || !passwordOk || !passwordsMatch}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white hover:bg-brand-primaryLight disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Update password"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
