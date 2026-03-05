import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { toLocalDateKey } from '../utils/date'
import TopStats from '../components/analytics/TopStats'
import StudyHeatmap from '../components/analytics/StudyHeatmap'
import SessionTypeMixCard from '../components/analytics/SessionTypeMixCard'
import CumulativeHoursCard from '../components/analytics/CumulativeHoursCard'
import Last30DaysCard from '../components/analytics/Last30DaysCard'
import YearlyStudyHoursCard from '../components/analytics/YearlyStudyHoursCard'

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

  const streakData = useMemo(() => {
    if (!sessionRows.length) {
      return { currentStreak: 0, longestStreak: 0 }
    }

    const totalsMap = new Map()
    sessionRows.forEach((session) => {
      const key = toLocalDateKey(session.start_time)
      if (!key) return
      const minutes = Number(session.duration_minutes) || 0
      totalsMap.set(key, (totalsMap.get(key) || 0) + minutes)
    })

    const sortedKeys = Array.from(totalsMap.keys()).sort()
    const startDate = new Date(sortedKeys[0])
    startDate.setHours(0, 0, 0, 0)

    const endDate = new Date()
    endDate.setHours(0, 0, 0, 0)

    let longestStreak = 0
    let running = 0
    const cursor = new Date(startDate)

    while (cursor <= endDate) {
      const key = toLocalDateKey(cursor)
      if ((totalsMap.get(key) || 0) > 0) {
        running += 1
        longestStreak = Math.max(longestStreak, running)
      } else {
        running = 0
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    let currentStreak = 0
    const backward = new Date(endDate)
    while ((totalsMap.get(toLocalDateKey(backward)) || 0) > 0) {
      currentStreak += 1
      backward.setDate(backward.getDate() - 1)
    }

    return { currentStreak, longestStreak }
  }, [sessionRows])

  return (
    <div className="space-y-6">
      <TopStats totals={totals} streakData={streakData} isDark={isDark} />

      <div className="flex gap-6">
        <div className="flex-1">
          <StudyHeatmap sessions={sessionRows} loading={loading} isDark={isDark} streakData={streakData} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SessionTypeMixCard
          loading={loading}
          typeData={typeData}
          analyticsCardClass={analyticsCardClass}
          analyticsTitleClass={analyticsTitleClass}
          analyticsMutedClass={analyticsMutedClass}
        />

        <CumulativeHoursCard
          loading={loading}
          cumulativeData={cumulativeData}
          analyticsCardClass={analyticsCardClass}
          analyticsTitleClass={analyticsTitleClass}
          analyticsMutedClass={analyticsMutedClass}
          analyticsGridStroke={analyticsGridStroke}
          analyticsTick={analyticsTick}
        />
      </div>

      <Last30DaysCard
        loading={loading}
        dailyData={dailyData}
        analyticsCardClass={analyticsCardClass}
        analyticsTitleClass={analyticsTitleClass}
        analyticsMutedClass={analyticsMutedClass}
        analyticsGridStroke={analyticsGridStroke}
        analyticsTick={analyticsTick}
      />

      <YearlyStudyHoursCard
        loading={loading}
        monthlyData={monthlyData}
        analyticsCardClass={analyticsCardClass}
        analyticsTitleClass={analyticsTitleClass}
        analyticsMutedClass={analyticsMutedClass}
        analyticsGridStroke={analyticsGridStroke}
        analyticsTick={analyticsTick}
      />
    </div>
  )
}

export default AnalyticsPage
