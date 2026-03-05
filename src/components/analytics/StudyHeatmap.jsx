import { useMemo, useState } from 'react'
import { toLocalDateKey } from '../../utils/date'

function StudyHeatmap({ sessions, loading, isDark = false, streakData }) {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const availableYears = useMemo(() => {
    const years = new Set()

    sessions.forEach((s) => {
      const y = new Date(s.start_time).getFullYear()
      years.add(y)
    })

    return Array.from(years).sort((a, b) => b - a)
  }, [sessions])

  const heatmap = useMemo(() => {
    const displayYear = selectedYear

    const rangeStart = new Date(displayYear, 0, 1)
    rangeStart.setHours(0, 0, 0, 0)

    const rangeEnd = new Date(displayYear, 11, 31)
    rangeEnd.setHours(23, 59, 59, 999)

    const totals = new Map()
    const counts = new Map()

    sessions.forEach((session) => {
      const key = toLocalDateKey(session.start_time)
      if (!key) return

      const minutes = Number(session.duration_minutes) || 0
      totals.set(key, (totals.get(key) || 0) + minutes)
      counts.set(key, (counts.get(key) || 0) + 1)
    })

    const firstGridDate = new Date(rangeStart)
    firstGridDate.setDate(rangeStart.getDate() - rangeStart.getDay())
    firstGridDate.setHours(0, 0, 0, 0)

    const totalDays = Math.floor((rangeEnd - firstGridDate) / (1000 * 60 * 60 * 24)) + 1
    const days = []

    for (let i = 0; i < totalDays; i += 1) {
      const date = new Date(firstGridDate)
      date.setDate(firstGridDate.getDate() + i)

      const key = toLocalDateKey(date)
      const inRange = date >= rangeStart && date <= rangeEnd

      days.push({
        key,
        date,
        inRange,
        minutes: inRange ? totals.get(key) || 0 : 0,
        sessionCount: inRange ? counts.get(key) || 0 : 0,
      })
    }

    const rangedDays = days.filter((day) => day.inRange)
    const activeDays = rangedDays.filter((day) => day.minutes > 0).length

    const weeks = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    const monthLabels = []
    let prevMonth = -1
    weeks.forEach((week, index) => {
      const firstInRange = week.find((day) => day?.inRange)
      if (!firstInRange) return

      const month = firstInRange.date.getMonth()
      if (month !== prevMonth) {
        monthLabels.push({
          index,
          label: firstInRange.date.toLocaleString([], { month: 'short' }),
        })
        prevMonth = month
      }
    })

    return {
      weeks,
      monthLabels,
      activeDays,
    }
  }, [sessions, selectedYear])

  const resolveCellClass = (entry) => {
    if (!entry || !entry.inRange) return isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
    if (entry.minutes <= 0) return isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-200 border-slate-300'
    if (entry.minutes <= 60) return isDark ? 'bg-emerald-900/50 border-slate-700' : 'bg-emerald-200 border-slate-200'
    if (entry.minutes <= 180) return isDark ? 'bg-emerald-700 border-slate-700' : 'bg-emerald-400 border-slate-200'
    if (entry.minutes <= 360) return isDark ? 'bg-emerald-600 border-slate-700' : 'bg-emerald-600 border-slate-200'
    return isDark ? 'bg-emerald-500 border-slate-700' : 'bg-emerald-800 border-slate-200'
  }

  return (
    <section className={['max-sm:hidden rounded-3xl p-6 shadow-sm border', isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'].join(' ')}>
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <h2 className={['text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>Study Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:min-w-[460px]">
          <div className={['rounded-2xl border px-3 py-2', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <div className={['text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Longest streak</div>
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{streakData.longestStreak} days</div>
          </div>
          <div className={['rounded-2xl border px-3 py-2', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <div className={['text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Total active days</div>
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{heatmap.activeDays}</div>
          </div>
          <div className={['rounded-2xl border px-3 py-2', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <div className={['text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Current streak</div>
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{streakData.currentStreak} days</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={['h-40 flex items-center justify-center text-sm', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Loading heatmap...</div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 overflow-x-auto">
            <div className="min-w-max">
              <div className={['pl-7 relative h-4 mb-2 text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400'].join(' ')}>
                {heatmap.monthLabels.map((month) => (
                  <span
                    key={`${month.label}-${month.index}`}
                    className="absolute"
                    style={{ left: `${month.index * 20}px` }}
                  >
                    {month.label}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <div className={['grid grid-rows-7 gap-1 text-[10px] leading-4 pt-[1px]', isDark ? 'text-slate-500' : 'text-slate-400'].join(' ')}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, idx) => (
                    <span key={`${label}-${idx}`} className="h-4 flex items-center">
                      {label}
                    </span>
                  ))}
                </div>

                <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
                  {heatmap.weeks.flatMap((week) => week).map((entry) => {
                    const label = entry.inRange
                      ? `${entry.date.toLocaleDateString()} | ${Math.round(entry.minutes)} min | ${entry.sessionCount} sessions`
                      : ''

                    return (
                      <div
                        key={entry.key}
                        className={[
                          'h-4 w-4 rounded-[3px] border transition-colors duration-200 transform hover:scale-110',
                          resolveCellClass(entry),
                        ].join(' ')}
                        title={label}
                      />
                    )
                  })}
                </div>
              </div>

              <div className={['mt-4 flex items-center justify-end gap-2 text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
                <span>Less</span>
                <span className={['h-3.5 w-3.5 rounded-[3px] border', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-slate-200'].join(' ')} />
                <span className={['h-3.5 w-3.5 rounded-[3px] border', isDark ? 'border-slate-700 bg-emerald-900/50' : 'border-slate-200 bg-emerald-200'].join(' ')} />
                <span className={['h-3.5 w-3.5 rounded-[3px] border', isDark ? 'border-slate-700 bg-emerald-700' : 'border-slate-200 bg-emerald-400'].join(' ')} />
                <span className={['h-3.5 w-3.5 rounded-[3px] border', isDark ? 'border-slate-700 bg-emerald-600' : 'border-slate-200 bg-emerald-600'].join(' ')} />
                <span className={['h-3.5 w-3.5 rounded-[3px] border', isDark ? 'border-slate-700 bg-emerald-500' : 'border-slate-200 bg-emerald-800'].join(' ')} />
                <span>More</span>
              </div>
            </div>
          </div>

          <div className="w-20 flex-shrink-0 flex flex-col gap-2 mt-5">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={[
                  'px-2 py-1 rounded-lg text-xs font-medium transition',
                  yr === selectedYear
                    ? 'bg-slate-600 text-white'
                    : isDark
                      ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default StudyHeatmap
