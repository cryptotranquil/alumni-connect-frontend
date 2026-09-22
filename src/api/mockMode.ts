/**
 * Mock-mode switch.
 *
 * The backend is unavailable during this phase of development, so every API
 * module below short-circuits to local data when MOCK_MODE is true. Flip it to
 * `false` to go back to real HTTP calls against the Express server.
 */
export const MOCK_MODE = false;

/** Simulate network latency so loading/skeleton states still show. */
export function mockDelay(ms = 320): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function mockDelayFast(): Promise<void> {
  return mockDelay(140);
}

export function mockIdentifiableUser() {
  try {
    const raw = localStorage.getItem("alumniConnectUser");
    if (raw) {
      const user = JSON.parse(raw);
      return { _id: user._id ?? "alu-1", role: user.role ?? "alumni" };
    }
  } catch {
    /* ignore */
  }
  return { _id: "alu-1", role: "alumni" };
}