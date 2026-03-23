import { StatCard } from '../../pages/AppPages'

function TopStats({ summary, formatHoursMinutes, isDark }) {
  return (
    // <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard
        label="Today"
        value={formatHoursMinutes(summary.todayMinutes)}
        sublabel="Study time tracked so far"
        accent="Live"
        isDark={isDark}
      />

      <StatCard
        label="This week"
        value={formatHoursMinutes(summary.weekMinutes)}
        sublabel="Across all sessions this week"
        isDark={isDark}
      />

      <StatCard
        label="This month"
        value={formatHoursMinutes(summary.monthMinutes)}
        sublabel="Time logged in the current month"
        isDark={isDark}
      />

      <StatCard
        label="Active streak"
        value={`${summary.streakDays} day${summary.streakDays === 1 ? '' : 's'}`}
        sublabel="Consecutive days with Pomodoro sessions"
        isDark={isDark}
      />
    </div>
  )
}

export default TopStats
