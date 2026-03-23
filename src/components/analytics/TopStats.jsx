import { StatCard } from '../../pages/AppPages'

function TopStats({ totals, streakData, insights, isDark = false }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard
        label="Active streak"
        value={`${streakData.currentStreak} day${streakData.currentStreak === 1 ? '' : 's'}`}
        sublabel="Consecutive study days"
        isDark={isDark}
      />
      <StatCard
        label="Total Time"
        value={`${Math.round(totals.totalMinutes / 60)}h`}
        sublabel="All recorded study time"
        isDark={isDark}
      />
      <StatCard
        label="Avg / Session"
        value={`${totals.averageMinutes}m`}
        sublabel="Average session duration"
        isDark={isDark}
      />
      <StatCard
        label="Consistency "
        value={`${Math.round(insights.consistency)}%`}
        sublabel="(Current Semester)"
        // sublabel="Active study days (Current Semester)"
        isDark={isDark}
      />
    </div>
  )
}

export default TopStats
