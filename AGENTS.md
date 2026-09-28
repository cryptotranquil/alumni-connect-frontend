# PROJECT — Exploits University Alumni Connect (frontend, repo `cryptotranquil/alumni-connect-frontend`)

## Objective
Deliver a **LinkedIn-inspired professional profile experience** for Students and Alumni: header, tabs (About/Posts/Tagged/Activity/Experience/Education/Skills/Achievements/Connections), `@`-mention post composer, activity timeline, profile sidebar, view mode (`/profile/:id`), and dynamic graduation years. Everything runs against the **live backend API — there is no mock data and no mock mode**.

## Important Details
- **Live API only.** `src/api/mockMode.ts` and every `src/data/mock*.ts` were deleted in commit `96fabd6`. `src/api/*` are thin axios wrappers only; there must be no fallback/seeded arrays, no `Promise.resolve(...)` stubs, and no `mock` references outside prose.
- **HTTP client**: `src/api/client.ts` — `api` axios instance; baseURL = `${VITE_API_BASE_URL}/api` when the env var is set, else relative `/api` (Vite proxy). A request interceptor injects `Authorization: Bearer <token>` from `localStorage["alumniConnectUser"]`. Always surface failures with `getErrorMessage(err, fallback)`.
- **Env**: copy `.env.example` → `.env` to point at another origin; leave unset to use the dev proxy. Backend needs its own secrets (Firebase service account, Brevo, Cloudinary, `JWT_SECRET`, `INITIAL_ADMIN_*`) in the backend repo — out of scope here.
- **Dev server**: `npm run dev` on **http://localhost:5173/**, proxying `/api` + `/socket.io` (ws) → `localhost:5000`. On Windows start it detached with `Start-Process npm.cmd -ArgumentList "run","dev" -RedirectStandardOutput "$env:TEMP\opencode\vite.log"` (plain `npm` fails with "%1 is not a valid Win32 application"). Log lives in `%TEMP%\opencode\vite.log`; socket-proxy ECONNREFUSED lines are expected while the backend is down.
- **Context file split (required by lint)**: `react-refresh/only-export-components` forbids exporting values from a component file, so each context is three files — `context/AuthContext.tsx` (provider, default export) + `context/AuthContextValue.ts` (context object + `User`/`UserRole`/`AuthContextType`) + `context/useAuth.ts` (hook, default + named export). Same shape for `SocketContext.tsx` / `SocketContextValue.ts` / `useSocket.ts`. **Consumers import from `../context/useAuth` / `../context/useSocket`**, never from the provider file.
- **Effects / lint rules**:
  - `set-state-in-effect` is a hard error — never call setState synchronously inside an effect. Accepted pattern: initialise `loading` to `true` and do all setState inside `.then/.catch/.finally`.
  - `react-hooks/exhaustive-deps` is a **warning we no longer tolerate**: every loader is a `useCallback` with a real dependency list and the effect depends on that callback (`useEffect(() => { void load(); }, [load])`). When a callback needs state (e.g. pagination) pass it as an argument instead of closing over it — see `NotificationsPage.tsx` `fetchNotifications(reset, targetPage)`.
  - Prefer derived `const selectedUserId = selected?.user._id` over reading object state inside effects (see `MessagingPage.tsx` socket subscription) so subscription churn is keyed on the primitive.
- **Custom window events**: notification live updates are dispatched as `notification:new` / `notification:read`; their payload type and the `WindowEventMap` entries live in `src/types/notificationEvents.d.ts` — extend that file instead of casting (`as any`) at `addEventListener`.
- **Code splitting**: `App.tsx` lazy-loads every route except `Home`, `LoginPage`, `RegisterPage` (eager for first paint) and wraps `<AppRoutes />` in `<Suspense fallback={<RouteFallback />}>` (full-screen spinner, same markup as the auth loading state). Build output: entry ~377 kB, largest chunk `analyticsApi` ~397 kB (recharts) — the >500 kB warning is resolved.
- **Do NOT clone LinkedIn** — LinkedIn-inspired UX; Exploits brand tokens: `brand-primary #27155f`, `primaryLight #3a2080`, `primaryDark #180d3d`, `brand-red #e40d0a`.
- **Graduation years**: `src/lib/gradYears.ts` — BASE_YEAR 1990, max = `max(currentYear()+9, 2035)`; students `expectedGraduationYears()` (current→max), alumni `alumniGraduationYears()` (1990→current). Used by registration (`MultiStepRegistration.tsx`), `EditProfileModal.tsx`, and the admin analytics filter (`src/data/analyticsFilters.ts`).
- **Campuses**: three Malawi campuses in `src/data/departments.ts` `CAMPUSES` — `BT` Blantyre, `LL` Lilongwe, `MZ` Mzuzu (old `HN`/`MD`/`BU` Zimbabwe codes are gone). Student-ID scheme `PROGRAMME/YY/CAMPUS/MODE/SEQ` (e.g. `BCS/24/LL/NE/001`), study modes `NE`/`ME`. All user-facing location copy is Malawi ("e.g. Lilongwe, Malawi").
- **`src/data/*` is static reference data only** — departments/campuses/programmes, `analyticsFilters.ts`, `postCategories.ts`, `suggestedSkills.ts`. Never add seeded users, posts, jobs, events, or analytics there.
- Strict TS: `noUnusedLocals`, `verbatimModuleSyntax` (type-only imports), `react-refresh/only-export-components`. `PostComment` is the comment type.
- **2FA dev code**: the backend returns `devCode` in non-production; the login/2FA pages surface it as a hint. It is a real server field, not mock data — keep the plumbing.
- **Debug logging**: `src/api/businessApi.ts`, `src/api/productsApi.ts` and the alumni business/product pages still contain leftover `console.log` calls (and commented-out logs) from before the API move; strip them when touching those files.

## Verification (all must pass before pushing)
```
npx tsc -b          # strict typecheck
npx eslint .        # 0 errors AND 0 warnings
npm run build       # no >500 kB chunk warning
```
The dev server should still answer HTTP 200 on http://localhost:5173/ after changes.

## Work State
### Completed (verified: tsc clean, `npx eslint .` 0 problems, build OK, dev server 200)
- Mock removal: `96fabd6` deleted mock mode/data; all of `src/api/*` now hits the live backend.
- Lint cleanup: `02afc6b` — context splits (`AuthContextValue`/`useAuth`, `SocketContextValue`/`useSocket`), no sync setState in effects, `exhaustive-deps` fixed via `useCallback` loaders, duplicate loaders collapsed, stale mock comments removed, `NotificationEventDetail` typing.
- Route-level code splitting (entry 1.23 MB → ~377 kB).
- Feed feature: `src/pages/FeedPage.tsx`, route `/feed`, Sidebar "Community", `lib/timeAgo.ts`, `postApi`.
- Profile backbone: `types/profile.ts` (`ProfileTabId` lives in `ProfileTabs.tsx`), `types/user.ts` (headline, location, coverPhoto, website, industry, yearsOfExperience, careerGoals, experiences, achievements), `types/directory.ts` `program?`, `lib/gradYears.ts`, `api/profileApi.ts` (public profile, experiences, education, achievements, posts, tagged posts, activity, suggestions, connections, connection status, photo change), `api/userApi.ts` (`getProfileApi`, `updateProfileApi`, departments CRUD, analytics, CV/photo upload).
- Profile components in `src/components/profile/` (barrel `index.ts`): ProfileHeader, ProfileTabs, ProfileAbout, PostComposer, PostCard, ProfilePostsSection, TaggedPostsSection, ActivityTimeline, ExperienceSection, EducationSection, SkillsSection, AchievementsSection, ConnectionsGrid, FollowersSection, RecommendationsSection, ProfileSidebar, ProfilePhotoModal, EditProfileModal, TagUserInput.
- `pages/ProfilePage.tsx`: own view (full editing) vs `/profile/:userId` view mode (Connect/Message), tab grid + sticky sidebar, admin own-profile fallback, modals wired, reload on activity change.
- Campus migration to Malawi; branding limited to landing/auth/dashboards (`Logo.png` on auth, `Logo-icon.png` in compact spots; no graduation-cap icon, no sidebar wordmark).

### Active / Blocked
- Nothing blocked. The backend must be running (with its own `.env`) for any feature to return data; that is a separate repo.

## Next Move
1. Optional polish: strip the leftover `console.log`s from `src/api/businessApi.ts`, `src/api/productsApi.ts`, and the alumni business/product pages; add `/profile/:id` links on dashboard/directory cards.
2. Backend work (separate repo): if any endpoint 404s, check it before touching the frontend — the frontend expects real REST for every function in `src/api/*`.

## Relevant Files
- Routing: `src/App.tsx` (lazy route table + `ProtectedRoute`/`AdminRoute`/`GuestRoute`).
- Contexts: `src/context/AuthContext.tsx`, `AuthContextValue.ts`, `useAuth.ts`, `SocketContext.tsx`, `SocketContextValue.ts`, `useSocket.ts`.
- API: `src/api/client.ts`, `profileApi.ts`, `userApi.ts`, `postApi.ts`, `connectionApi.ts`, `authApi.ts`, `notificationApi.ts`, `messageApi.ts`, `analyticsApi.ts`, `businessApi.ts`, `productsApi.ts`, `jobApi.ts`, `eventApi.ts`, `directoryApi.ts`, `mentorshipApi.ts`, `groupsApi.ts`, `followApi.ts`, `recommendationApi.ts`, `alumniRosterApi.ts`.
- Reference data: `src/data/departments.ts`, `analyticsFilters.ts`, `postCategories.ts`, `suggestedSkills.ts`; helpers in `src/lib/gradYears.ts`, `profileDisplay.ts`, `socketUrl.ts`, `timeAgo.ts`, `utils.ts`.
- Types: `src/types/*` (profile, user, directory, post, notification + `notificationEvents.d.ts`, analytics, job, event, group, message, connection, business, product).
- Config: `vite.config.ts` (alias `@` → `src`, dev proxy), `eslint.config.js`, `.env.example`.
