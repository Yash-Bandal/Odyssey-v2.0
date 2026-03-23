// import { useEffect, useMemo, useState } from 'react'
// import { supabase } from '../supabaseClient'
// import { WEEKDAY_LABELS } from '../constants/analytics'
// import { TIME_BADGES } from '../constants/rewards'
// import { toLocalDateKey, getStartOfWeekMonday } from '../utils/date'
// import TopStats from '../components/dashboard/TopStats'
// import DailyProgressCard from '../components/dashboard/DailyProgressCard'
// import StudyDaysCard from '../components/dashboard/StudyDaysCard'
// import StudyTrendCard from '../components/dashboard/StudyTrendCard'
// import WeekdayConsistencyCard from '../components/dashboard/WeekdayConsistencyCard'
// import RewardsSection from '../components/dashboard/RewardsSection'
// import QuickTodoCard from '../components/dashboard/QuickTodoCard'

// import StudyTimeImg from '../assets/StudyTime.png'
// import WeekDaysImg from '../assets/weekdays.png'
// import ActivityImg from '../assets/Activity.png'
// import RewLogo from '../assets/rewards/RewLogo.PNG'

// function DashboardPlaceholder({ user, semester, sessionsVersion, isDark = false }) {
//   const [trendView, setTrendView] = useState('week')
//   const [summary, setSummary] = useState({
//     todayMinutes: 0,
//     weekMinutes: 0,
//     monthMinutes: 0,
//     totalSessions: 0,
//     streakDays: 0,
//     activeDays: 0,
//     aboveTargetDays: 0,
//     dailyAvgMinutes: 0,
//     thisWeek: [0, 0, 0, 0, 0, 0, 0],
//     lastWeek: [0, 0, 0, 0, 0, 0, 0],
//     weekdayAvg: [0, 0, 0, 0, 0, 0, 0],
//     semesterTotalHours: 0,
//     semesterStudiedHours: 0,
//     semesterRemainingHours: 0,
//     semesterRemainingDays: 0,
//     semesterRequiredDailyHours: 0,
//     thisMonth: [],
//     lastMonth: [],
//   })
//   const [rewardBadges, setRewardBadges] = useState([])
//   const [todoInput, setTodoInput] = useState('')
//   const [todoItems, setTodoItems] = useState(() => {
//     if (typeof window === 'undefined') return []
//     try {
//       const raw = window.localStorage.getItem('odyssey:dashboardTodos')
//       if (!raw) return []
//       const parsed = JSON.parse(raw)
//       return Array.isArray(parsed) ? parsed : []
//     } catch {
//       return []
//     }
//   })

//   useEffect(() => {
//     const load = async () => {
//       //  GLOBAL (lifetime sessions)
//       const { data: allSessions } = await supabase
//         .from('sessions')
//         // .select('duration_minutes')
//         .select('start_time, duration_minutes')
//         .eq('user_id', user.id)



//       const { data, error } = await supabase
//         .from('sessions')
//         .select('start_time, end_time, duration_minutes, type')
//         .eq('user_id', user.id)
//         .eq('semester_id', semester.id)
//         .order('start_time', { ascending: false })
//         .limit(1000)


//       const globalDayTotals = new Map()
//       let totalLifetimeMinutes = 0

//         allSessions?.forEach((session) => {
//           const key = toLocalDateKey(session.start_time)
//           const minutes = Number(session.duration_minutes) || 0

//           totalLifetimeMinutes += minutes

//           if (!key) return
//           globalDayTotals.set(key, (globalDayTotals.get(key) || 0) + minutes)
//         })

//       const totalLifetimeHours = totalLifetimeMinutes / 60
//       //====================================================

//       const semesterStart = new Date(semester.start_date)
//       const semesterEnd = new Date(semester.end_date)
//       const today = new Date()
//       const totalGoalHours = Number(semester.total_goal_hours) || 0

//       let totalStudiedMinutes = 0
//         data.forEach((session) => { //current semester completed hours only
//         totalStudiedMinutes += Number(session.duration_minutes) || 0
//       })
//       //   (data || []).forEach((session) => {
//       //   totalStudiedMinutes += Number(session.duration_minutes) || 0
//       // })

//       const totalStudiedHours = totalStudiedMinutes / 60
//       const remainingHours = Math.max(totalGoalHours - totalStudiedHours, 0)
//       const oneDayMs = 1000 * 60 * 60 * 24
//       const remainingDays = semesterEnd > today ? Math.ceil((semesterEnd - today) / oneDayMs) : 0
//       const requiredDailyHours = remainingDays > 0 ? remainingHours / remainingDays : 0


//       //===============Pace calculation ->on track and all status ===============
//       // Days passed in semester
//       const totalSemesterDays = Math.floor((semesterEnd - semesterStart) / oneDayMs) + 1
      
//       const daysPassed =
//         today < semesterStart
//           ? 0
//           : Math.min(
//               Math.floor((today - semesterStart) / oneDayMs) + 1,
//               totalSemesterDays
//             )
      
//       // Actual pace
//       const actualDailyHours =
//         daysPassed > 0 ? totalStudiedHours / daysPassed : 0

//       let status = {
//         label: '',
//         color: '',
//         bg: '',
//       }
      
//       if (requiredDailyHours === 0) {
//         status = {
//           label: 'No goal set',
//           color: 'text-slate-500',
//           bg: 'bg-slate-100',
//         }
//       } else if (daysPassed === 0) {
//         status = {
//           label: 'Not started',
//           color: 'text-slate-500',
//           bg: 'bg-slate-100',
//         }
//       } else if (actualDailyHours === 0) {
//         status = {
//           label: 'Start studying',
//           color: 'text-red-600',
//           bg: 'bg-red-50',
//         }
//       } else {
//         const upperBound = requiredDailyHours * 1.1
//         const lowerBound = requiredDailyHours * 0.9
      
//         if (actualDailyHours > upperBound) {
//           status = {
//             label: 'Ahead of schedule',
//             color: 'text-sky-600',
//             bg: 'bg-sky-50',
//           }
//         } else if (actualDailyHours >= lowerBound) {
//           status = {
//             label: 'On track',
//             color: 'text-emerald-700',
//             bg: 'bg-emerald-50',
//           }
//         } else if (actualDailyHours >= requiredDailyHours * 0.6) {
//           status = {
//             label: 'Catch up',
//             color: 'text-yellow-700',
//             bg: 'bg-yellow-50',
//           }
//         } else {
//           status = {
//             label: 'Falling behind',
//             color: 'text-red-700',
//             bg: 'bg-red-50',
//           }
//         }
//       }
//      //========================================================

//       // if (error || !data) {
//       //   setSummary({
//       //     todayMinutes: 0,
//       //     weekMinutes: 0,
//       //     monthMinutes: 0,
//       //     totalSessions: 0,
//       //     streakDays: 0,
//       //     activeDays: 0,
//       //     aboveTargetDays: 0,
//       //     dailyAvgMinutes: 0,
//       //     thisWeek: [0, 0, 0, 0, 0, 0, 0],
//       //     lastWeek: [0, 0, 0, 0, 0, 0, 0],
//       //     weekdayAvg: [0, 0, 0, 0, 0, 0, 0],
//       //   })
//       //   setRewardBadges([])
//       //   return
//       // }

//       if (error) {
//         console.error(error)

//         setSummary({
//           todayMinutes: 0,
//           weekMinutes: 0,
//           monthMinutes: 0,
//           totalSessions: 0,
//           streakDays: 0,
//           activeDays: 0,
//           aboveTargetDays: 0,
//           dailyAvgMinutes: 0,
//           thisWeek: [0, 0, 0, 0, 0, 0, 0],
//           lastWeek: [0, 0, 0, 0, 0, 0, 0],
//           weekdayAvg: [0, 0, 0, 0, 0, 0, 0],
//         })

//         setRewardBadges([])
//         return
//       }

//       if (!data) {
//         return
//       }



//       const now = new Date()
//       const todayKey = toLocalDateKey(now)
//       const startOfWeek = getStartOfWeekMonday(now)
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

//       let todayMinutes = 0
//       let weekMinutes = 0
//       let monthMinutes = 0

//       const activeDayKeys = new Set()
//       const dayTotals = new Map()
//       const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
//       const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]

//       // data.forEach((session) => { //current semetser
//       allSessions?.forEach((session) => { //global
//         const duration = Number(session.duration_minutes) || 0
//         const date = new Date(session.start_time)
//         const key = toLocalDateKey(date)

//         if (key === todayKey) todayMinutes += duration
//         if (date >= startOfWeek) weekMinutes += duration
//         if (date >= startOfMonth) monthMinutes += duration

//         const streakDateKey = toLocalDateKey(session.start_time)
//         if (streakDateKey) activeDayKeys.add(streakDateKey)

//         dayTotals.set(key, (dayTotals.get(key) || 0) + duration)
//         const sundayIndex = date.getDay()
//         const mondayIndex = sundayIndex === 0 ? 6 : sundayIndex - 1
//         weekdayTotals[mondayIndex] += duration
//         weekdayCounts[mondayIndex] += 1
//       })

//       let streakDays = 0
//       if (activeDayKeys.size > 0) {
//         const cursor = new Date()
//         for (;;) {
//           const key = toLocalDateKey(cursor)
//           if (!activeDayKeys.has(key)) break
//           streakDays += 1
//           cursor.setDate(cursor.getDate() - 1)
//         }
//       }

//       const activeDays = dayTotals.size
//       let dailyAvgMinutes = 0
//       if (activeDays > 0) {
//         let sum = 0
//         for (const value of dayTotals.values()) sum += value
//         dailyAvgMinutes = Math.round(sum / activeDays)
//       }

//       const dailyTargetMin = Number(semester.daily_required_hours) > 0 ? Number(semester.daily_required_hours) * 60 : 0
//       let aboveTargetDays = 0
//       if (dailyTargetMin > 0) {
//         for (const value of dayTotals.values()) {
//           if (value >= dailyTargetMin) aboveTargetDays += 1
//         }
//       }

//       const minutesForKey = (key) => globalDayTotals.get(key) || 0
//       // const minutesForKey = (key) => dayTotals.get(key) || 0


//       const thisWeek = []
//       const lastWeek = []
//       const weekStart = new Date(startOfWeek)
//       const lastWeekStart = new Date(startOfWeek)
//       lastWeekStart.setDate(startOfWeek.getDate() - 7)

//       for (let i = 0; i < 7; i += 1) {
//         const d1 = new Date(weekStart)
//         d1.setDate(weekStart.getDate() + i)
//         const k1 = toLocalDateKey(d1)
//         thisWeek.push(minutesForKey(k1))

//         const d2 = new Date(lastWeekStart)
//         d2.setDate(lastWeekStart.getDate() + i)
//         const k2 = toLocalDateKey(d2)
//         lastWeek.push(minutesForKey(k2))
//       }

//       const weekdayAvg = WEEKDAY_LABELS.map((_, index) => {
//         const count = weekdayCounts[index]
//         return count > 0 ? Math.round(weekdayTotals[index] / count) : 0
//       })

//       const thisMonth = []
//       const lastMonth = []
//       const nowDate = new Date()
//       const thisMonthStart = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
//       const lastMonthStart = new Date(nowDate.getFullYear(), nowDate.getMonth() - 1, 1)
//       const lastMonthEnd = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0)
//       const daysInThisMonth = new Date(nowDate.getFullYear(), nowDate.getMonth() + 1, 0).getDate()

//       for (let i = 0; i < daysInThisMonth; i++) {
//         const d1 = new Date(thisMonthStart)
//         d1.setDate(thisMonthStart.getDate() + i)
//         const k1 = toLocalDateKey(d1)
//         thisMonth.push(minutesForKey(k1))

//         const d2 = new Date(lastMonthStart)
//         d2.setDate(lastMonthStart.getDate() + i)
//         const k2 = toLocalDateKey(d2)
//         thisMonth.length === lastMonth.length
//           ? lastMonth.push(minutesForKey(k2))
//           : lastMonth.push(minutesForKey(k2))
//       }

//       setSummary({
//         todayMinutes,
//         weekMinutes,
//         monthMinutes,
//         totalSessions: data.length,
//         streakDays,
//         activeDays,
//         aboveTargetDays,
//         dailyAvgMinutes,
//         thisWeek,
//         lastWeek,
//         weekdayAvg,
//         semesterTotalHours: totalGoalHours,
//         semesterStudiedHours: totalStudiedHours,
//         semesterRemainingHours: remainingHours,
//         semesterRemainingDays: remainingDays,
//         semesterRequiredDailyHours: requiredDailyHours,
//         // ======== status ================
//         status,
//         //===============================
//         thisMonth,
//         lastMonth,

//         totalLifetimeHours,
//       })

//       const { data: existingRewards } = await supabase
//         .from('user_rewards')
//         .select('reward_key, unlock_count, last_unlocked_date')
//         .eq('user_id', user.id)

//       const rewardsMap = new Map((existingRewards || []).map((row) => [row.reward_key, row]))
//       const upsertTasks = []

//       const nextBadges = TIME_BADGES.map((badge) => {
//         const existing = rewardsMap.get(badge.key)
//         const currentCount = Number(existing?.unlock_count) || 0
//         const lastDate = existing?.last_unlocked_date || null
//         const unlockedToday = todayMinutes >= badge.thresholdMinutes
//         const nextCount = unlockedToday && lastDate !== todayKey ? currentCount + 1 : currentCount

//         if (unlockedToday) {
//           upsertTasks.push(
//             supabase.from('user_rewards').upsert(
//               {
//                 user_id: user.id,
//                 reward_key: badge.key,
//                 unlock_count: nextCount,
//                 last_unlocked_date: todayKey,
//               },
//               { onConflict: 'user_id,reward_key' },
//             ),
//           )
//         }

//         return {
//           key: badge.key,
//           label: badge.label,
//           description: `${badge.thresholdMinutes}+ minutes today`,
//           unlocked: unlockedToday,
//           unlockCount: nextCount,
//         }
//       })

//       if (upsertTasks.length) await Promise.all(upsertTasks)
//       setRewardBadges(nextBadges)
//     }

//     load()
//   }, [user.id, semester.id, sessionsVersion, semester.daily_required_hours])

//   useEffect(() => {
//     if (typeof window === 'undefined') return
//     window.localStorage.setItem('odyssey:dashboardTodos', JSON.stringify(todoItems))
//   }, [todoItems])

//   const formatHoursMinutes = (minutesValue) => {
//     const total = Number(minutesValue) || 0
//     const hours = Math.floor(total / 60)
//     const minutes = Math.round(total % 60)
//     if (!hours && !minutes) return '0m'
//     if (!hours) return `${minutes}m`
//     return `${hours}h ${minutes.toString().padStart(2, '0')}m`
//   }

//   const dailyTargetHours = Number(semester.daily_required_hours) || 0
//   const todayHours = summary.todayMinutes / 60
//   const targetMinutes = dailyTargetHours * 60
//   const progressFraction = targetMinutes > 0 ? Math.min(summary.todayMinutes / targetMinutes, 1) : 0
//   const progressPercent = Math.round(progressFraction * 100)
//   const circleRadius = 18
//   const circleCircumference = 2 * Math.PI * circleRadius
//   const circleOffset = circleCircumference * (1 - progressFraction)

//   const trendChartData = useMemo(() => {
//     if (trendView === 'week') {
//       return WEEKDAY_LABELS.map((day, index) => ({
//         label: day,
//         current: summary.thisWeek[index] || 0,
//         previous: summary.lastWeek[index] || 0,
//       }))
//     }

//     return summary.thisMonth.map((value, index) => ({
//       label: `Day ${index + 1}`,
//       current: summary.thisMonth[index] || 0,
//       previous: summary.lastMonth[index] || 0,
//     }))
//   }, [trendView, summary.thisWeek, summary.lastWeek, summary.thisMonth, summary.lastMonth])

//   const dashboardCardClass = isDark
//     ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm px-8 py-8'
//     : 'rounded-3xl bg-white border border-slate-200 shadow-sm px-8 py-8'
//   const dashboardTitleClass = isDark
//     ? 'text-xl font-semibold text-slate-100'
//     : 'text-xl font-semibold text-slate-900'
//   const dashboardMutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500'
//   const dashboardStrongTextClass = isDark ? 'font-semibold text-slate-100' : 'font-semibold text-slate-900'

//   const weekdayConsistencyData = useMemo(
//     () =>
//       WEEKDAY_LABELS.map((day, index) => ({
//         day,
//         avgMinutes: summary.weekdayAvg[index] || 0,
//       })),
//     [summary.weekdayAvg],
//   )

//   const handleAddTodo = (event) => {
//     event.preventDefault()
//     const title = todoInput.trim()
//     if (!title) return
//     setTodoItems((prev) => [
//       ...prev,
//       { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, done: false },
//     ])
//     setTodoInput('')
//   }

//   const handleToggleTodo = (id) => {
//     setTodoItems((prev) => prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)))
//   }

//   const handleDeleteTodo = (id) => {
//     setTodoItems((prev) => prev.filter((item) => item.id !== id))
//   }

//   const unlockedRewardCount = useMemo(
//     () => rewardBadges.filter((reward) => reward.unlocked).length,
//     [rewardBadges],
//   )
//   const completedTodoCount = useMemo(
//     () => todoItems.filter((item) => item.done).length,
//     [todoItems],
//   )

//   return (
//     <div className="space-y-10 ">
//       <TopStats summary={summary} formatHoursMinutes={formatHoursMinutes} isDark={isDark} />

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           <DailyProgressCard
//             isDark={isDark}
//             dashboardCardClass={dashboardCardClass}
//             dashboardTitleClass={dashboardTitleClass}
//             dashboardMutedTextClass={dashboardMutedTextClass}
//             dashboardStrongTextClass={dashboardStrongTextClass}
//             StudyTimeImg={StudyTimeImg}
//             circleRadius={circleRadius}
//             circleCircumference={circleCircumference}
//             circleOffset={circleOffset}
//             dailyTargetHours={dailyTargetHours}
//             progressPercent={progressPercent}
//             todayHours={todayHours}
//             progressFraction={progressFraction}
//             summary={summary}
//             formatHoursMinutes={formatHoursMinutes}
//           />
//         </div>

//         <div className="space-y-8">
//           <StudyDaysCard
//             isDark={isDark}
//             dashboardCardClass={dashboardCardClass}
//             dashboardTitleClass={dashboardTitleClass}
//             dashboardMutedTextClass={dashboardMutedTextClass}
//             dashboardStrongTextClass={dashboardStrongTextClass}
//             ActivityImg={ActivityImg}
//             summary={summary}
//             status={summary.status} //status
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//         <StudyTrendCard
//           isDark={isDark}
//           dashboardCardClass={dashboardCardClass}
//           dashboardTitleClass={dashboardTitleClass}
//           dashboardMutedTextClass={dashboardMutedTextClass}
//           trendView={trendView}
//           setTrendView={setTrendView}
//           trendChartData={trendChartData}
//         />

//         <WeekdayConsistencyCard
//           isDark={isDark}
//           dashboardCardClass={dashboardCardClass}
//           dashboardTitleClass={dashboardTitleClass}
//           weekdayConsistencyData={weekdayConsistencyData}
//           WeekDaysImg={WeekDaysImg}
//         />
//       </div>

//       <RewardsSection
//         isDark={isDark}
//         dashboardCardClass={dashboardCardClass}
//         dashboardTitleClass={dashboardTitleClass}
//         dashboardMutedTextClass={dashboardMutedTextClass}
//         rewardBadges={rewardBadges}
//         unlockedRewardCount={unlockedRewardCount}
//         RewLogo={RewLogo}
//       />

//       <QuickTodoCard
//         isDark={isDark}
//         dashboardCardClass={dashboardCardClass}
//         dashboardTitleClass={dashboardTitleClass}
//         dashboardMutedTextClass={dashboardMutedTextClass}
//         todoInput={todoInput}
//         setTodoInput={setTodoInput}
//         handleAddTodo={handleAddTodo}
//         todoItems={todoItems}
//         completedTodoCount={completedTodoCount}
//         handleToggleTodo={handleToggleTodo}
//         handleDeleteTodo={handleDeleteTodo}
//       />
//     </div>
//   )
// }

// export default DashboardPlaceholder
