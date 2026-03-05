# Odyssey Study Planner

Odyssey is a React + Vite + Tailwind + Supabase study planning app for semester-based planning, session tracking, analytics, and rewards.

## Tech Stack
- Frontend: React 19, React Router
- Styling: Tailwind CSS
- Charts: Recharts
- Backend: Supabase (Auth + Postgres)
- Alerts/UI feedback: SweetAlert2
- Icons: Lucide React

## Core Features
- Authentication with email/password and password reset
- Semester onboarding wizard (first-time setup)
- Dashboard with:
  - Daily/weekly/monthly stats
  - Daily progress ring
  - Study trend charts
  - Weekday consistency radar chart
  - Rewards preview
  - Quick todo
- Sessions page:
  - Pomodoro + stopwatch timer
  - Manual session logging
  - Session filters/history
- Goals page:
  - Semester start/end and total-hour target planning
  - Auto-calculated daily/weekly pace
  - Subject target hour/weight management
- Rewards page:
  - Time-based, timing-based, and streak-based badges
- Analytics page:
  - Heatmap activity view
  - Session mix, cumulative, monthly/yearly charts
- Calendar page for session/event-oriented view
- Theme switching (light/dark) persisted in localStorage

## Project Structure
```text
Odyssey-v2.0/
  public/
  src/
    assets/                 # images/audio
    components/
      analytics/            # Analytics UI components
      auth/                 # Auth screens + semester setup wizard
      dashboard/            # Dashboard UI components
      goals/                # Goals UI components
      layout/               # App shell and navigation
      rewards/              # Rewards UI components
      sessions/             # Sessions UI components
      ui/                   # Shared inputs/widgets (e.g. DatePicker)
    constants/              # app constants (navigation, rewards, analytics labels)
    hooks/                  # custom hooks (e.g. semester calculations)
    pages/                  # route-level page orchestrators
    services/               # service clients (legacy/alternate supabase client path exists)
    utils/                  # utility helpers (date, sound, reward engine)
    AppRoot.jsx             # auth/session bootstrap and app gatekeeping
    main.jsx                # app entry
    supabaseClient.js       # primary Supabase client
  .env                      # local env vars (not committed)
  package.json
  tailwind.config.js
  vite.config.js
```

## App Routing
Defined in `src/components/layout/AppShell.jsx`:
- `/` Dashboard
- `/sessions`
- `/rewards`
- `/goals`
- `/analytics`
- `/calendar`
- `/settings`
- `/reset-password`

## Prerequisites
- Node.js 18+
- npm 9+
- Supabase project

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` in project root:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

3. Start development server:
```bash
npm run dev
```

4. Build production bundle:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Environment Variables
Required vars (read in `src/supabaseClient.js`):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

If either is missing, app initialization throws an error.

## Supabase Backend Connection
The app uses `createClient` from `@supabase/supabase-js` in `src/supabaseClient.js` and imports that singleton across pages/components.

## Expected Database Tables
Based on current code usage, these tables are required:

### `semesters`
- `id` (pk)
- `user_id` (fk to auth user)
- `start_date`
- `end_date`
- `total_goal_hours`
- `total_study_days`
- `daily_required_hours`
- `weekly_required_hours`

### `subjects`
- `id` (pk)
- `semester_id` (fk)
- `name`
- `target_hours`
- `weight`

### `sessions`
- `id` (pk)
- `user_id` (fk)
- `semester_id` (fk)
- `subject_id` (nullable fk)
- `name`
- `type` (`pomodoro` | `stopwatch` | `manual`)
- `start_time`
- `end_time`
- `duration_minutes`
- `notes`

### `user_rewards`
- `user_id` (fk)
- `reward_key`
- `unlock_count`
- `last_unlocked_date`
- unique constraint on `(user_id, reward_key)`

## Authentication Flow
- App bootstraps in `AppRoot.jsx`
- Checks `supabase.auth.getUser()`
- Requires confirmed email
- Loads latest semester for authenticated user
- Routes user to:
  - Auth screen (if logged out)
  - Semester setup wizard (if no semester)
  - App shell/pages (if ready)

## Scripts
From `package.json`:
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview build
- `npm run lint` - run ESLint

## Notes
- Keep `.env` out of version control.
- The app stores some UI/timer state in localStorage.
- `src/services/supabaseClient.js` exists in addition to `src/supabaseClient.js`; current page code primarily uses `src/supabaseClient.js`.
