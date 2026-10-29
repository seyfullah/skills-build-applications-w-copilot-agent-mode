# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep React components responsible for rendering and accessible loading, empty, and error states; use the shared API client for relative `/api` requests rather than embedding transport details in each page.
- Logic tier decision: Keep HTTP handling in Express routes and capability validation/business rules in the backend service layer. Return deliberate 4xx responses for invalid or unknown input rather than allowing database cast errors to become 500 responses.
- Data tier decision: Define required fields, types, and defaults in the Mongoose models. Keep seed data representative and idempotent; update only the demo records and preserve unrelated application data.
- Activity tracking approach: Validate the request shape, ObjectId syntax, and existence of both referenced user and team before creating an activity. Persist the submitted references, activity type, and minutes, calculate points in the service, and set `occurredAt` when creating the record.
- Team management approach: Require a non-empty name, preserve the submitted name and mascot, and support the members array when creating and listing teams.
- Leaderboard approach: Aggregate activity points by team, sort totals descending, and assign each returned team a 1-based rank.
- Workout suggestions approach: Find the user by email, consider their fitness goal and recent activities when choosing the first workout suggestion, and include a reason tied to that goal or activity. Return a deliberate 4xx response if no user matches.

## Test plan

- Data tier: `npm run test:data --prefix octofit-tracker/backend` — **4 failed, 1 passed**. Failures mean model validation is missing for required user, team, activity, and workout fields. The seed/idempotency test passed.
- API: `npm run test:api --prefix octofit-tracker/backend` — **4 failed**. Failures mean activity/team creation still returns `501`, the leaderboard returns no ranked results, and workout suggestions do not follow the requested user's goal/activity.
- Presentation: `npm test --prefix octofit-tracker/frontend` — **15 failed**. Failures mean the pages still show placeholders instead of API data and the required accessible loading, empty, and error states.
- Backend build: `npm run build --prefix octofit-tracker/backend` — **passed** (`tsc --noEmit`).
- Frontend build: `npm run build --prefix octofit-tracker/frontend` — **passed** (TypeScript check and Vite production build).

The test and build outcomes above are the baseline run before implementing the decisions. Re-run the relevant focused contract suite after each tier change; a failing assertion identifies a gap in that tier's contract, while a build failure indicates a TypeScript or production-compilation problem.
