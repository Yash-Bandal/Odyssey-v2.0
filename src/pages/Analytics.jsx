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

  //=========global analytics======
  const [mode, setMode] = useState('global') // 'semester' | 'global'

  const [comparison, setComparison] = useState({
    currentHours: 0,
    prevHours: 0,
    improvement: 0,
  })

  const [insights, setInsights] = useState({
    consistency: 0,
    missedDays: 0,
    avgSessionMinutes: 0,
    peakTime: '',
    bestDay: '',
    lowDay: '',
  })


  //===================================
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
//=======================fix ranges
    const today = new Date()

      let rangeStart

      if (mode === 'semester') {
        const semesterStart = semester?.start_date
          ? new Date(`${semester.start_date}T00:00:00`)
          : null

        rangeStart = semesterStart && !isNaN(semesterStart)
          ? semesterStart
          : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29)
      } else {
        // GLOBAL → last 365 days (GitHub style)
        rangeStart = new Date(today)
        rangeStart.setDate(today.getDate() - 364)
      }

      rangeStart.setHours(0, 0, 0, 0)


//=======================================

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

          //============only 1 semester fetcher===================
      // const { data, error } = await supabase
      //   .from('sessions')
      //   .select('start_time, duration_minutes, type')
      //   .eq('user_id', user.id)
      //   .eq('semester_id', semester.id)
      //   .order('start_time', { ascending: true })
      //   .limit(10000)
      //========================================

      let query = supabase
        .from('sessions')
        .select('start_time, duration_minutes, type')
        .eq('user_id', user.id)
        .order('start_time', { ascending: true })
        .limit(10000)

      // if (mode === 'semester') {
      //   query = query.eq('semester_id', semester.id)
      // }
      if (mode === 'semester') {
        query = query.eq('semester_id', semester.id)
      } else {
        // GLOBAL → include all semesters explicitly (important)
        query = query.not('semester_id', 'is', null)
      }


      const { data, error } = await query


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

      // ================= SEMESTER COMPARISON =================

      // Only run in semester mode
      let comparisonData = {
        currentHours: 0,
        prevHours: 0,
        improvement: 0,
      }

      if (mode === 'semester') {
        // 1. get previous semester
        const { data: prevSemester } = await supabase
          .from('semesters')
          .select('*')
          .eq('user_id', user.id)
          .lt('end_date', semester.start_date)
          .order('end_date', { ascending: false })
          .limit(1)
          .single()

        if (prevSemester) {
          // 2. fetch its sessions
          const { data: prevSessions } = await supabase
            .from('sessions')
            .select('duration_minutes')
            .eq('user_id', user.id)
            .eq('semester_id', prevSemester.id)

          const prevRows = prevSessions || []

          // 3. compute current
          const currentMinutes = data.reduce(
            (sum, s) => sum + (Number(s.duration_minutes) || 0),
            0
          )

          // 4. compute previous
          const prevMinutes = prevRows.reduce(
            (sum, s) => sum + (Number(s.duration_minutes) || 0),
            0
          )

          const currentHours = currentMinutes / 60
          const prevHours = prevMinutes / 60

          let improvement = 0
          if (prevHours > 0) {
            improvement = ((currentHours - prevHours) / prevHours) * 100
          }

          comparisonData = {
            currentHours,
            prevHours,
            improvement,
          }
        }
      }

      // set state
      setComparison(comparisonData)

      // =====================================================
      // ================= INSIGHTS =================

      // 1. Build day map (reuse pattern)
      const dayTotalsMap = new Map()

      data.forEach((session) => {
        const key = toLocalDateKey(session.start_time)
        const minutes = Number(session.duration_minutes) || 0

        if (!key) return
        dayTotalsMap.set(key, (dayTotalsMap.get(key) || 0) + minutes)
      })

      // 2. Consistency + missed days
      let totalDays = 0
      let activeDays = 0

      const startDate = new Date(rangeStart)
      const endDate = new Date()

      startDate.setHours(0, 0, 0, 0)
      endDate.setHours(0, 0, 0, 0)

      const cursor = new Date(startDate)

      while (cursor <= endDate) {
        totalDays += 1
        const key = toLocalDateKey(cursor)

        if ((dayTotalsMap.get(key) || 0) > 0) {
          activeDays += 1
        }

        cursor.setDate(cursor.getDate() + 1)
      }

      const consistency = totalDays > 0 ? (activeDays / totalDays) * 100 : 0
      const missedDays = totalDays - activeDays

      // 3. Session length insight
      let totalMinutes = 0
      data.forEach((s) => {
        totalMinutes += Number(s.duration_minutes) || 0
      })

      const avgSessionMinutes =
        data.length > 0 ? totalMinutes / data.length : 0

      // 4. Time distribution
      const buckets = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0,
      }

      data.forEach((session) => {
        const date = new Date(session.start_time)
        const hour = date.getHours()
        const minutes = Number(session.duration_minutes) || 0

        if (hour >= 5 && hour < 12) buckets.morning += minutes
        else if (hour < 17) buckets.afternoon += minutes
        else if (hour < 21) buckets.evening += minutes
        else buckets.night += minutes
      })

      // find peak
      let peakTime = 'None'
      let max = 0

      Object.entries(buckets).forEach(([key, value]) => {
        if (value > max) {
          max = value
          peakTime = key
        }
      })


      // 5. Best / low Day (based on avg minutes)

      const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
      const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]

      data.forEach((session) => {
        const date = new Date(session.start_time)
        const day = date.getDay() // 0 = Sunday

        const minutes = Number(session.duration_minutes) || 0

        weekdayTotals[day] += minutes
        weekdayCounts[day] += 1
      })

      // avg per day
      const weekdayAvg = weekdayTotals.map((total, i) =>
        weekdayCounts[i] > 0 ? total / weekdayCounts[i] : 0
      )

      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

      let bestDay = 'None'
      let lowDay = 'None'

      let maxD = 0
      let min = Infinity

      weekdayAvg.forEach((value, i) => {
        if (value > maxD) {
          maxD = value
          bestDay = days[i]
        }

        if (value > 0 && value < min) {
          min = value
          lowDay = days[i]
        }
      })

      // save
      setInsights({
        consistency,
        missedDays,
        avgSessionMinutes,
        peakTime,
        bestDay,
        lowDay,
      })

      // ============================================

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
      let totalSessionMinutes = 0

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
        totalSessionMinutes += duration
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


      //==================old cumulative working
      // let running = 0
      // const cumulativeRows = dailyRows.map((row) => {
      //   running += Number(row.minutes) || 0
      //   return {
      //     day: row.day,
      //     hours: Math.round((running / 60) * 10) / 10,
      //   }
      // })

    //============global adaptive cumulative graph
      let running = 0

      // build daily map FIRST (works for both modes)
      const dailyMap = new Map()

      // sessionRows.forEach((session) => {
      data.forEach((session) => {
        const key = toLocalDateKey(session.start_time)
        if (!key) return

        const minutes = Number(session.duration_minutes) || 0
        dailyMap.set(key, (dailyMap.get(key) || 0) + minutes)
      })

      // sort properly (IMPORTANT FIX)
      const sortedDays = Array.from(dailyMap.keys()).sort(
        (a, b) => new Date(a) - new Date(b)
      )

      // build cumulative (same as old logic)
      const cumulativeRows = sortedDays.map((day) => {
        running += dailyMap.get(day)
        return {
          day: day,
          hours: Math.round((running / 60) * 10) / 10,
        }
      })

      //=================================


      
      setSessionRows(data)
      setDailyData(dailyRows)
      setMonthlyData(monthlyRows)
      setTypeData(sessionTypeRows)

      // console.log('sessionRows:', sessionRows.length)
      // console.log('cumulativeRows:', cumulativeRows.length)


      setCumulativeData(cumulativeRows)
      setTotals({
        totalMinutes: Math.round(totalMinutes),
        averageMinutes: data.length ? Math.round(totalMinutes / data.length) : 0,
        totalSessions: data.length,
      })
      setLoading(false)
    }

    load()




  }, [user.id, semester.id, semester.start_date, sessionsVersion, mode])

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



      {/* //================ Global analytics ======================= */}
      <div className="flex justify-between items-center">

        <h2 className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
          Analytics
        </h2>

        <div
          className={`flex p-1 rounded-xl ${isDark
              ? 'bg-slate-800 border border-slate-700'
              : 'bg-slate-100 border border-slate-200'
            }`}
        >
          <button
            onClick={() => setMode('global')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'global'
                ? isDark
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Global
          </button>

          <button
            onClick={() => setMode('semester')}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${mode === 'semester'
                ? isDark
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-white text-slate-900 shadow-sm'
                : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            Semester
          </button>
        </div>

      </div>

      {/* //======================================= */}



      <TopStats
        totals={totals}
        streakData={streakData}
        insights={insights}   
        isDark={isDark}
      />

      {mode === 'semester' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">


          <div className="xl:col-span-2">
            <div className={`${analyticsCardClass} p-5 flex flex-col gap-5`}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className={analyticsTitleClass}>Semester Comparison</h2>

                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${comparison.currentHours >= comparison.prevHours
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-rose-500/10 text-rose-500'
                    }`}
                >
                  {comparison.currentHours >= comparison.prevHours
                    ? 'Doing Better'
                    : 'Needs Focus'}
                </span>
              </div>

              {/* Main Hours */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className="text-xs text-slate-400">Current Semester</p>
                  <p className="text-2xl font-semibold">
                    {comparison.currentHours.toFixed(1)}h
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Previous Semester</p>
                  <p className="text-2xl font-semibold text-slate-400">
                    {comparison.prevHours.toFixed(1)}h
                  </p>
                </div>
              </div>

              {/* Difference */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Difference</span>

                <span
                  className={`font-medium ${comparison.currentHours >= comparison.prevHours
                    ? 'text-emerald-500'
                    : 'text-rose-500'
                    }`}
                >
                  {comparison.currentHours >= comparison.prevHours ? '+' : '-'}
                  {Math.abs(
                    comparison.currentHours - comparison.prevHours
                  ).toFixed(1)}h
                </span>
              </div>

              {/* Daily Average (assuming ~120 days semester, tweak if needed) */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Daily Avg</span>

                <div className="flex gap-4">
                  <span>
                    {(
                      comparison.currentHours / 120
                    ).toFixed(1)}h
                  </span>
                  <span className="text-slate-400">
                    vs {(
                      comparison.prevHours / 120
                    ).toFixed(1)}h
                  </span>
                </div>
              </div>

              {/* Visual Bar Comparison */}
              {/* <div className="flex flex-col gap-2">
                <div className="text-xs text-slate-400">Relative Effort</div>

                <div className="flex gap-2 h-2 w-full">
                  <div
                    className="bg-sky-500 rounded-full"
                    style={{
                      width: `${(comparison.currentHours /
                        Math.max(
                          comparison.currentHours,
                          comparison.prevHours
                        )) *
                        100
                        }%`,
                    }}
                  />
                  <div
                    className="bg-slate-300 dark:bg-slate-700 rounded-full"
                    style={{
                      width: `${(comparison.prevHours /
                        Math.max(
                          comparison.currentHours,
                          comparison.prevHours
                        )) *
                        100
                        }%`,
                    }}
                  />
                </div>
              </div> */}

            </div>
          </div>


{/* the stack  */}

          <div className="xl:col-span-1 flex flex-col gap-6">

            {/* Missed Days */}
            <div className={`${analyticsCardClass} p-5 flex-1 flex flex-col justify-center`}>
              <p className={analyticsMutedClass}>Missed Days</p>
              <p className="text-2xl font-semibold">
                {insights.missedDays}
              </p>
            </div>

            {/* Peak Time */}
            <div className={`${analyticsCardClass} p-5 flex-1 flex flex-col justify-center`}>
              <p className={analyticsMutedClass}>Peak Time</p>
              <p className="text-2xl font-semibold capitalize">
                {insights.peakTime}
              </p>
            </div>

          </div>

          {/* Best / low Day */}
          <div className={`${analyticsCardClass} p-5 flex flex-col gap-4`}>

            <p className={analyticsMutedClass}>Best / Low Day</p>

            <div className="flex flex-col gap-3 text-sm">

              {/* Best */}
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Best</span>
                <span className="text-emerald-500 font-semibold text-base">
                  {insights.bestDay}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t  border-slate-210 dark:border-slate-400" />

              {/* low */}
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Low</span>
                <span className="text-rose-500 font-semibold text-base">
                  {insights.lowDay}
                </span>
              </div>

            </div>
          </div>


        </div>
      )}

      

      <div className="flex gap-6">
        <div className="flex-1">
          <StudyHeatmap
            sessions={sessionRows}
            loading={loading}
            isDark={isDark}
            streakData={streakData}
            mode={mode}
            semester={semester}
          />
        </div>
      </div>




      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SessionTypeMixCard
          loading={loading}
          typeData={typeData}
          analyticsCardClass={analyticsCardClass}
          analyticsTitleClass={analyticsTitleClass}
          analyticsMutedClass={analyticsMutedClass}
          isDark={isDark}  
        />


        <CumulativeHoursCard
          loading={loading}
          cumulativeData={cumulativeData}
          analyticsCardClass={analyticsCardClass}
          analyticsTitleClass={analyticsTitleClass}
          analyticsMutedClass={analyticsMutedClass}
          analyticsGridStroke={analyticsGridStroke}
          analyticsTick={analyticsTick}

          mode={mode}
          isDark={isDark}  

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
        mode={mode}
        isDark={isDark}  

      />

      <YearlyStudyHoursCard
        loading={loading}
        monthlyData={monthlyData}
        analyticsCardClass={analyticsCardClass}
        analyticsTitleClass={analyticsTitleClass}
        analyticsMutedClass={analyticsMutedClass}
        analyticsGridStroke={analyticsGridStroke}
        analyticsTick={analyticsTick}
        mode={mode}
        isDark={isDark}  

      />

      
    </div>
  )
}

export default AnalyticsPage
