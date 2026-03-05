# Odyssey v2.0 -  Study Planner 🎓

---
> [!Tip]
> # Gamify studying, make progress visible.
---

Odyssey is a **Study Planning App** for rewarding consistency, semester-based planning, session tracking, and analytics.

## Tech Stack
- Frontend: React 19, React Router
- Styling: Tailwind CSS
- Charts: Recharts
- Backend: Supabase (Auth + Postgres)
- Alerts/UI feedback: SweetAlert2
- Icons: Lucide React



<br>

##  First Look

<table>
  <tr>
    <td align="center" width="600">
 <img width="350"  alt="image" src="https://github.com/Yash-Bandal/Odyssey-v2.0/blob/14abc67ce56ae6765236bde7fc9b7be76b37bb03/Docs/dashboard.png" />
      <br>
      <b> Dashboard </b>
    </td>
    <td align="center" width="600">
     <img width="350"  alt="image" src="https://github.com/Yash-Bandal/Odyssey-v2.0/blob/14abc67ce56ae6765236bde7fc9b7be76b37bb03/Docs/streak-tracker.png" />
      <br>
      <b>Consistency Tracker</b>
    </td>
  </tr>
</table>

<br>


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
│
├── public/
│   ├── image.png
│   ├── vite.svg
│   └── _redirects
│
├── src/
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── AppRoot.jsx
│   ├── index.css
│   ├── main.jsx
│   └── supabaseClient.js
│
│   ├── assets/                     # Images, audio, reward badges
│
│   ├── components/
│   │
│   │   ├── analytics/              # Analytics UI components
│   │   │   ├── CumulativeHoursCard.jsx
│   │   │   ├── Last30DaysCard.jsx
│   │   │   ├── SessionTypeMixCard.jsx
│   │   │   ├── StudyHeatmap.jsx
│   │   │   ├── TopStats.jsx
│   │   │   └── YearlyStudyHoursCard.jsx
│   │
│   │   ├── auth/                   # Authentication + onboarding
│   │   │   ├── AuthScreen.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── SemesterSetupWizard.jsx
│   │
│   │   ├── dashboard/              # Dashboard UI widgets
│   │   │   ├── DailyProgressCard.jsx
│   │   │   ├── QuickTodoCard.jsx
│   │   │   ├── RewardsSection.jsx
│   │   │   ├── StudyDaysCard.jsx
│   │   │   ├── StudyTrendCard.jsx
│   │   │   ├── TopStats.jsx
│   │   │   └── WeekdayConsistencyCard.jsx
│   │
│   │   ├── goals/                  # Semester planning components
│   │   │   ├── GoalsHeader.jsx
│   │   │   ├── GoalsNotesCard.jsx
│   │   │   ├── SemesterPlanningCard.jsx
│   │   │   └── SubjectsCard.jsx
│   │
│   │   ├── layout/                 # App shell and routing layout
│   │   │   └── AppShell.jsx
│   │
│   │   ├── rewards/                # Rewards UI
│   │   │   ├── RewardCard.jsx
│   │   │   ├── RewardHeader.jsx
│   │   │   └── RewardSection.jsx
│   │
│   │   ├── sessions/               # Study session features
│   │   │   ├── ActiveTimerPanel.jsx
│   │   │   ├── ManualSessionForm.jsx
│   │   │   ├── PomodoroSettingsPanel.jsx
│   │   │   └── SessionHistory.jsx
│   │
│   │   └── ui/                     # Shared UI components
│   │       └── DatePicker.jsx
│
│   ├── constants/                  # Static config/constants
│   │   ├── analytics.js
│   │   ├── navigation.js
│   │   └── rewards.js
│
│   ├── hooks/                      # Custom React hooks
│   │   ├── useRewardEngine.js
│   │   └── useSemesterCalculations.js
│
│   ├── pages/                      # Route-level page controllers
│   │   ├── Analytics.jsx
│   │   ├── AppPages.jsx
│   │   ├── Calendar.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Goals.jsx
│   │   ├── Rewards.jsx
│   │   ├── Sessions.jsx
│   │   └── Settings.jsx
|   |
│   └── utils/                      # Helper utilities
│       ├── date.js
│       ├── rewardEngine.js
│       └── sound.js
│
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
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
For detailed setup, refer -[docs](https://github.com/Yash-Bandal/Odyssey-v2.0/blob/main/Docs/Readme_setup.md)

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
Based on current code usage, these [tables](https://github.com/Yash-Bandal/Odyssey-v2.0/blob/main/Docs/Readme_supabase_db.md) are required:

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
