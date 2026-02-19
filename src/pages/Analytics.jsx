import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { supabase } from '../supabaseClient'
import { toLocalDateKey } from '../utils/date'
import { StatCard } from './AppPages'

function AnalyticsPage({ user, semester, sessionsVersion, isDark = false }) {
  const [loading, setLoading] = useState(true)
  const [sessionRows, setSessionRows] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [typeData, setTypeData] = useState([])
  const [cumulativeData, setCumulativeData] = useState([])
  const [totals, setTotals] = useState({
    totalMinutes: 0,
    averageMinutes: 0,
    totalSessions: 0,
  })
  const analyticsCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
  const analyticsTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const analyticsMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const analyticsGridStroke = isDark ? '#334155' : '#e2e8f0'
  const analyticsTick = isDark ? '#cbd5e1' : '#64748b'

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const today = new Date()
      const oneYearAgo = new Date(today)
      oneYearAgo.setDate(today.getDate() - 364)
      oneYearAgo.setHours(0, 0, 0, 0)
      const semesterStart = semester?.start_date ? new Date(`${semester.start_date}T00:00:00`) : null
      const rangeStart =
        semesterStart && !Number.isNaN(semesterStart.getTime()) && semesterStart > oneYearAgo
          ? semesterStart
          : oneYearAgo

      const { data, error } = await supabase
        .from('sessions')
        .select('start_time, duration_minutes, type')
        .eq('user_id', user.id)
        .eq('semester_id', semester.id)
        .gte('start_time', rangeStart.toISOString())
        .order('start_time', { ascending: true })
        .limit(10000)

      if (error || !data) {
        setSessionRows([])
        setDailyData([])
        setMonthlyData([])
        setTypeData([])
        setCumulativeData([])
        setTotals({
          totalMinutes: 0,
          averageMinutes: 0,
          totalSessions: 0,
        })
        setLoading(false)
        return
      }

      const start = new Date(today)
      start.setDate(today.getDate() - 29)
      start.setHours(0, 0, 0, 0)

      const dayMap = new Map()
      for (let i = 0; i < 30; i += 1) {
        const d = new Date(start)
        d.setDate(start.getDate() + i)
        dayMap.set(toLocalDateKey(d), 0)
      }

      const monthlyTotals = Array(12).fill(0)
      const typeTotals = { pomodoro: 0, stopwatch: 0, manual: 0 }
      const currentYear = today.getFullYear()
      let totalMinutes = 0

      data.forEach((session) => {
        const duration = Number(session.duration_minutes) || 0
        const sessionDate = new Date(session.start_time)
        const dayKey = toLocalDateKey(sessionDate)

        if (dayMap.has(dayKey)) {
          dayMap.set(dayKey, dayMap.get(dayKey) + duration)
        }

        if (sessionDate.getFullYear() === currentYear) {
          monthlyTotals[sessionDate.getMonth()] += duration
        }
        if (typeTotals[session.type] !== undefined) {
          typeTotals[session.type] += duration
        }
        totalMinutes += duration
      })

      const dailyRows = Array.from(dayMap.entries()).map(([key, minutes]) => ({
        day: key.slice(5),
        minutes: Math.round(minutes),
      }))

      const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const monthlyRows = monthLabels.map((month, index) => ({
        month,
        hours: Math.round((monthlyTotals[index] / 60) * 10) / 10,
      }))

      const sessionTypeRows = [
        { name: 'Pomodoro', minutes: Math.round(typeTotals.pomodoro) },
        { name: 'Stopwatch', minutes: Math.round(typeTotals.stopwatch) },
        { name: 'Manual', minutes: Math.round(typeTotals.manual) },
      ]

      let running = 0
      const cumulativeRows = dailyRows.map((row) => {
        running += Number(row.minutes) || 0
        return {
          day: row.day,
          hours: Math.round((running / 60) * 10) / 10,
        }
      })

      setSessionRows(data)
      setDailyData(dailyRows)
      setMonthlyData(monthlyRows)
      setTypeData(sessionTypeRows)
      setCumulativeData(cumulativeRows)
      setTotals({
        totalMinutes: Math.round(totalMinutes),
        averageMinutes: data.length ? Math.round(totalMinutes / data.length) : 0,
        totalSessions: data.length,
      })
      setLoading(false)
    }

    load()
  }, [user.id, semester.id, semester.start_date, sessionsVersion])

  return (
    <div className="space-y-6">
      {/* Top header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Sessions" value={`${totals.totalSessions}`} sublabel="Tracked in this semester" isDark={isDark} />
        <StatCard label="Total Time" value={`${Math.round(totals.totalMinutes / 60)}h`} sublabel="All recorded study time" isDark={isDark} />
        <StatCard label="Avg / Session" value={`${totals.averageMinutes}m`} sublabel="Average session duration" isDark={isDark} />
      </div>

      {/* Github Like heatmap */}
      <StudyHeatmap  sessions={sessionRows} loading={loading} isDark={isDark} />


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <section className={analyticsCardClass}>
          <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Session Type Mix</h2>
          <div className="h-72">
            {loading ? (
              <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    dataKey="minutes"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} min`, 'Total']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={analyticsCardClass}>
          <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>30-Day Cumulative Hours</h2>
          <div className="h-72">
            {loading ? (
              <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cumulativeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
                  <XAxis dataKey="day" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip formatter={(value) => [`${value} h`, 'Cumulative']} />
                  <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      </div>


      <section className={analyticsCardClass}>
        <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Last 30 Days</h2>
        <div className="h-72">
          {loading ? (
            <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="analyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
                <XAxis dataKey="day" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(value) => [`${value} min`, 'Study time']} />
                <Area type="monotone" dataKey="minutes" stroke="#0284c7" strokeWidth={2.5} fill="url(#analyticsAreaFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className={analyticsCardClass}>
        <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Yearly Study Hours (Jan-Dec)</h2>
        <div className="h-72">
          {loading ? (
            <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
                <XAxis dataKey="month" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(value) => [`${value} h`, 'Total']} />
                <Bar dataKey="hours" fill="#14b8a6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>



    </div>
  )
}

function StudyHeatmap({ sessions, loading, isDark = false }) {
  const heatmap = useMemo(() => {
    const displayYear = 2026
    const rangeStart = new Date(displayYear, 0, 1)
    rangeStart.setHours(0, 0, 0, 0)
    const rangeEnd = new Date(displayYear, 11, 31)
    rangeEnd.setHours(23, 59, 59, 999)
    const today = new Date()

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
    const daysUntilToday = rangedDays.filter((day) => day.date <= today)
    const activeDays = rangedDays.filter((day) => day.minutes > 0).length

    let longestStreak = 0
    let currentStreak = 0
    let running = 0

    daysUntilToday.forEach((day) => {
      if (day.minutes > 0) {
        running += 1
      } else {
        running = 0
      }
      longestStreak = Math.max(longestStreak, running)
    })

    for (let i = daysUntilToday.length - 1; i >= 0; i -= 1) {
      if (daysUntilToday[i].minutes <= 0) break
      currentStreak += 1
    }

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
      longestStreak,
      currentStreak,
    }
  }, [sessions])

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
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{heatmap.longestStreak} days</div>
          </div>
          <div className={['rounded-2xl border px-3 py-2', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <div className={['text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Total active days</div>
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{heatmap.activeDays}</div>
          </div>
          <div className={['rounded-2xl border px-3 py-2', isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'].join(' ')}>
            <div className={['text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Current streak</div>
            <div className={['mt-0.5 text-lg font-semibold', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>{heatmap.currentStreak} days</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={['h-40 flex items-center justify-center text-sm', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>Loading heatmap...</div>
      ) : (
        <div className="overflow-x-auto">
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
                  <span key={`${label}-${idx}`} className="h-4 flex items-center">{label}</span>
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

            <div className={['mt-3 flex items-center justify-end gap-2 text-[11px]', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
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
      )}
    </section>
  )
}


export default AnalyticsPage
