import { StatCard } from '../../pages/AppPages'

function TopStats({ totals, streakData, isDark = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Active Streak"
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
    </div>
  )
}

export default TopStats
