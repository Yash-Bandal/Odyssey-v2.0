import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts'
import { supabase } from '../supabaseClient'
import { WEEKDAY_LABELS } from '../constants/analytics'
import { REWARD_ICONS, TIME_BADGES } from '../constants/rewards'
import { toLocalDateKey, getStartOfWeekMonday } from '../utils/date'
import { StatCard } from './AppPages'

import StudyTimeImg from "../assets/StudyTime.png";
import WeekDaysImg from "../assets/weekdays.png";
import ActivityImg from "../assets/Activity.png";
import RewLogo from "../assets/rewards/RewLogo.PNG";

import { Plus, Check, Trash2, ListTodo } from "lucide-react"

function DashboardPlaceholder({ user, semester, sessionsVersion, isDark = false }) {
  const [summary, setSummary] = useState({
    todayMinutes: 0,
    weekMinutes: 0,
    monthMinutes: 0,
    totalSessions: 0,
    streakDays: 0,
    activeDays: 0,
    aboveTargetDays: 0,
    dailyAvgMinutes: 0,
    thisWeek: [0, 0, 0, 0, 0, 0, 0],
    lastWeek: [0, 0, 0, 0, 0, 0, 0],
    weekdayAvg: [0, 0, 0, 0, 0, 0, 0],
  })
  const [rewardBadges, setRewardBadges] = useState([])
  const [todoInput, setTodoInput] = useState('')
  const [todoItems, setTodoItems] = useState(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem('odyssey:dashboardTodos')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('start_time, end_time, duration_minutes, type')
        .eq('user_id', user.id)
        .eq('semester_id', semester.id)
        .order('start_time', { ascending: false })
        .limit(500)

      if (error || !data) {
        setSummary({
          todayMinutes: 0,
          weekMinutes: 0,
          monthMinutes: 0,
          totalSessions: 0,
          streakDays: 0,
          activeDays: 0,
          aboveTargetDays: 0,
          dailyAvgMinutes: 0,
          thisWeek: [0, 0, 0, 0, 0, 0, 0],
          lastWeek: [0, 0, 0, 0, 0, 0, 0],
          weekdayAvg: [0, 0, 0, 0, 0, 0, 0],
        })
        setRewardBadges([])
        return
      }

      const now = new Date()
      const todayKey = toLocalDateKey(now)
      const startOfWeek = getStartOfWeekMonday(now)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      let todayMinutes = 0
      let weekMinutes = 0
      let monthMinutes = 0
      const pomodoroDayKeys = new Set()
      const dayTotals = new Map() // key: 'YYYY-MM-DD' -> minutes
      const weekdayTotals = [0, 0, 0, 0, 0, 0, 0]
      const weekdayCounts = [0, 0, 0, 0, 0, 0, 0]
      data.forEach((session) => {
        const duration = Number(session.duration_minutes) || 0
        const date = new Date(session.start_time)
        const key = toLocalDateKey(date)

        if (key === todayKey) {
          todayMinutes += duration
        }

        if (date >= startOfWeek) {
          weekMinutes += duration
        }

        if (date >= startOfMonth) {
          monthMinutes += duration
        }

        if (session.type === 'pomodoro') {
          const streakDateKey = toLocalDateKey(session.end_time || session.start_time)
          if (streakDateKey) {
            pomodoroDayKeys.add(streakDateKey)
          }
        }

        dayTotals.set(key, (dayTotals.get(key) || 0) + duration)
        const sundayIndex = date.getDay()
        const mondayIndex = sundayIndex === 0 ? 6 : sundayIndex - 1
        weekdayTotals[mondayIndex] += duration
        weekdayCounts[mondayIndex] += 1
      })

      let streakDays = 0
      if (pomodoroDayKeys.size > 0) {
        const cursor = new Date()
        for (; ;) {
          const key = toLocalDateKey(cursor)
          if (!pomodoroDayKeys.has(key)) {
            break
          }
          streakDays += 1
          cursor.setDate(cursor.getDate() - 1)
        }
      }

      const activeDays = dayTotals.size
      let dailyAvgMinutes = 0
      if (activeDays > 0) {
        let sum = 0
        for (const value of dayTotals.values()) sum += value
        dailyAvgMinutes = Math.round(sum / activeDays)
      }
      const dailyTargetMin = Number(semester.daily_required_hours) > 0 ? Number(semester.daily_required_hours) * 60 : 0
      let aboveTargetDays = 0
      if (dailyTargetMin > 0) {
        for (const value of dayTotals.values()) {
          if (value >= dailyTargetMin) aboveTargetDays += 1
        }
      }

      // Build study trend arrays (this week vs last week)
      const minutesForKey = (key) => dayTotals.get(key) || 0
      const thisWeek = []
      const lastWeek = []
      const weekStart = new Date(startOfWeek)
      const lastWeekStart = new Date(startOfWeek)
      lastWeekStart.setDate(startOfWeek.getDate() - 7)
      for (let i = 0; i < 7; i += 1) {
        const d1 = new Date(weekStart)
        d1.setDate(weekStart.getDate() + i)
        const k1 = toLocalDateKey(d1)
        thisWeek.push(minutesForKey(k1))

        const d2 = new Date(lastWeekStart)
        d2.setDate(lastWeekStart.getDate() + i)
        const k2 = toLocalDateKey(d2)
        lastWeek.push(minutesForKey(k2))
      }
      const weekdayAvg = WEEKDAY_LABELS.map((_, index) => {
        const count = weekdayCounts[index]
        return count > 0 ? Math.round(weekdayTotals[index] / count) : 0
      })

      setSummary({
        todayMinutes,
        weekMinutes,
        monthMinutes,
        totalSessions: data.length,
        streakDays,
        activeDays,
        aboveTargetDays,
        dailyAvgMinutes,
        thisWeek,
        lastWeek,
        weekdayAvg,
      })

      const { data: existingRewards } = await supabase
        .from('user_rewards')
        .select('reward_key, unlock_count, last_unlocked_date')
        .eq('user_id', user.id)

      const rewardsMap = new Map((existingRewards || []).map((row) => [row.reward_key, row]))
      const upsertTasks = []

      const nextBadges = TIME_BADGES.map((badge) => {
        const existing = rewardsMap.get(badge.key)
        const currentCount = Number(existing?.unlock_count) || 0
        const lastDate = existing?.last_unlocked_date || null
        const unlockedToday = todayMinutes >= badge.thresholdMinutes
        const nextCount =
          unlockedToday && lastDate !== todayKey
            ? currentCount + 1
            : currentCount

        if (unlockedToday) {
          upsertTasks.push(
            supabase.from('user_rewards').upsert(
              {
                user_id: user.id,
                reward_key: badge.key,
                unlock_count: nextCount,
                last_unlocked_date: todayKey,
              },
              { onConflict: 'user_id,reward_key' },
            ),
          )
        }

        return {
          key: badge.key,
          label: badge.label,
          description: `${badge.thresholdMinutes}+ minutes today`,
          unlocked: unlockedToday,
          unlockCount: nextCount,
        }
      })

      if (upsertTasks.length) {
        await Promise.all(upsertTasks)
      }
      setRewardBadges(nextBadges)
    }

    load()
  }, [user.id, semester.id, sessionsVersion, semester.daily_required_hours])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('odyssey:dashboardTodos', JSON.stringify(todoItems))
  }, [todoItems])

  const formatHoursMinutes = (minutesValue) => {
    const total = Number(minutesValue) || 0
    const hours = Math.floor(total / 60)
    const minutes = Math.round(total % 60)
    if (!hours && !minutes) return '0m'
    if (!hours) return `${minutes}m`
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  const dailyTargetHours = Number(semester.daily_required_hours) || 0
  const todayHours = summary.todayMinutes / 60
  const targetMinutes = dailyTargetHours * 60
  const progressFraction =
    targetMinutes > 0 ? Math.min(summary.todayMinutes / targetMinutes, 1) : 0
  const progressPercent = Math.round(progressFraction * 100)
  const circleRadius = 18
  const circleCircumference = 2 * Math.PI * circleRadius
  const circleOffset = circleCircumference * (1 - progressFraction)
  const trendChartData = useMemo(
    () =>
      WEEKDAY_LABELS.map((day, index) => ({
        day,
        thisWeek: summary.thisWeek[index] || 0,
        lastWeek: summary.lastWeek[index] || 0,
      })),
    [summary.thisWeek, summary.lastWeek],
  )
  const dashboardCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm px-8 py-8'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm px-8 py-8'
  const dashboardTitleClass = isDark
    ? 'text-xl font-semibold text-slate-100'
    : 'text-xl font-semibold text-slate-900'
  const dashboardMutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const dashboardStrongTextClass = isDark ? 'font-semibold text-slate-100' : 'font-semibold text-slate-900'
  const weekdayConsistencyData = useMemo(
    () =>
      WEEKDAY_LABELS.map((day, index) => ({
        day,
        avgMinutes: summary.weekdayAvg[index] || 0,
      })),
    [summary.weekdayAvg],
  )

  const handleAddTodo = (event) => {
    event.preventDefault()
    const title = todoInput.trim()
    if (!title) return
    setTodoItems((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, done: false },
    ])
    setTodoInput('')
  }

  const handleToggleTodo = (id) => {
    setTodoItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    )
  }

  const handleDeleteTodo = (id) => {
    setTodoItems((prev) => prev.filter((item) => item.id !== id))
  }

  const unlockedRewardCount = useMemo(
    () => rewardBadges.filter((reward) => reward.unlocked).length,
    [rewardBadges],
  )
  const completedTodoCount = useMemo(
    () => todoItems.filter((item) => item.done).length,
    [todoItems],
  )

  return (
    <div className="space-y-10 ">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

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
          label="Current streak"
          value={`${summary.streakDays} day${summary.streakDays === 1 ? '' : 's'}`}
          sublabel="Consecutive days with Pomodoro sessions"
          isDark={isDark}
        />
      </div>


      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">

          {/* ===== GOALS ===== */}
          <div className={dashboardCardClass}>

            <div className="flex items-center justify-between mb-6 relative">
                
              <h2 className={dashboardTitleClass}>
                Daily Progress
              </h2>

                          {/* {!isDark && (
                          <img
                              src={StudyTimeImg}
                              alt="Study illustration"
                              className="w-32 h-auto opacity-80 absolute top-0 right-0 max-sm:top-10 max-sm:w-24"
                          />
                          )} */}
                          <img
                              src={StudyTimeImg}
                              alt="Study time"
                              className={[
                                  "w-32 h-auto transition-opacity absolute top-0 right-0 max-sm:top-10 max-sm:w-24",
                                  isDark ? "opacity-20" : "opacity-80"
                              ].join(" ")}
                          />

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10">

              {/* BIG PROGRESS CIRCLE */}
              <div className="relative h-36 w-36 flex items-center justify-center">

                <svg className="h-36 w-36 -rotate-90" viewBox="0 0 40 40">

                  <defs>
                    <linearGradient id="goalGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#66f5a0" />   {/* lighter mint */}
                      <stop offset="60%" stopColor="#00e060" />  {/* main brand green */}
                      <stop offset="100%" stopColor="#00b84d" /> {/* deeper emerald */}
                    </linearGradient>
                  </defs>

                  {/* Background ring */}
                  <circle
                    cx="20"
                    cy="20"
                    r={circleRadius}
                    fill="none"
                    stroke={isDark ? "#1e293b" : "#e2e8f0"}
                    strokeWidth="4"
                  />

                  {/* Progress ring */}
                  <circle
                    cx="20"
                    cy="20"
                    r={circleRadius}
                    fill="none"
                    stroke="url(#goalGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={circleOffset}
                    style={{
                      filter: "drop-shadow(0px 0px 8px rgba(0,224,96,0.35))",
                    }}
                  />

                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 bg-clip-text text-transparent"> */}
                  <div
                    className={[
                      'text-3xl font-bold',
                      isDark ? 'text-white' : 'text-black',
                    ].join(' ')}
                  >
                    {dailyTargetHours ? `${progressPercent}%` : '—'}
                  </div>

                  <div className="text-xs text-slate-500 tracking-wide">
                    Daily Progress
                  </div>
                </div>
              </div>


              {/* TEXT DETAILS */}
              <div className="space-y-4 flex-1">

                

                <div className={`text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {dailyTargetHours
                    ? `${todayHours.toFixed(1)}h / ${dailyTargetHours.toFixed(1)}h`
                    : 'Set semester goal'}
                </div>


                <div className={`text-sm ${dashboardMutedTextClass}`}>
                  {dailyTargetHours
                    ? progressFraction >= 1
                      ? 'Daily target achieved '
                      : 'Keep logging sessions to reach 100%'
                    : 'Daily target is derived from semester configuration.'}
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4">

                  <div className="space-y-1">
                    <div className={dashboardMutedTextClass}>
                      Today
                    </div>
                    <div className={`text-lg font-semibold ${dashboardStrongTextClass}`}>
                      {formatHoursMinutes(summary.todayMinutes)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className={dashboardMutedTextClass}>
                      Total sessions
                    </div>
                    <div className={`text-lg font-semibold ${dashboardStrongTextClass}`}>
                      {summary.totalSessions}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">

          {/* ===== STUDY DAYS ===== */}
          <div className={dashboardCardClass}>

            <div className="flex items-center justify-between mb-12 relative ">
              <h2 className={dashboardTitleClass}>
                Study Days
              </h2>
                 {/* <img
                    src={ActivityImg}
                    alt="Study illustration"
                    className="w-24 h-auto  absolute top-0 right-20 opacity-80 max-sm:top-0 max-sm:opacity-60 "
                 /> */}

                          <img
                              src={ActivityImg}
                              alt="Activity"
                              className={[
                                  "w-24 h-auto transition-opacity duration-300 bsolute top-0 right-20  max-sm:top-0 ",
                                  isDark ? "opacity-20" : "opacity-80"
                              ].join(" ")}
                          />

              <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
                On track
              </span>
            </div>

            <div className="space-y-4 text-sm pb-2">

              <div className=" flex justify-between">
                <span className={dashboardMutedTextClass}>Active days</span>
                <span className={dashboardStrongTextClass}>{summary.activeDays}</span>
              </div>

              <div className="flex justify-between">
                <span className={dashboardMutedTextClass}>Days above target</span>
                <span className={dashboardStrongTextClass}>{summary.aboveTargetDays}</span>
              </div>

              <div className="flex justify-between">
                <span className={dashboardMutedTextClass}>Daily average</span>
                <span className={dashboardStrongTextClass}>
                  {formatHoursMinutes(summary.dailyAvgMinutes)}
                </span>
              </div>
{/*               
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.from({ length: 14 }).map((_, index) => (
              <span
                key={index}
                className={[
                  'h-3 w-3 rounded-full',
                  index > 10
                    ? 'bg-slate-200'
                    : index > 7
                      ? 'bg-emerald-300'
                      : 'bg-emerald-500',
                ].join(' ')}
              />
            ))}
          </div> */}

            </div>
          </div>

          {/* ===== UPCOMING ===== */}
          {/* <div className="rounded-3xl bg-white border border-slate-200 shadow-sm px-8 py-8">

        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Upcoming Focus Blocks
        </h2>

        <div className="space-y-4 text-sm">

          <div className="flex justify-between">
            <span className="text-slate-700">Deep work Â· Algorithms</span>
            <span className="text-slate-500">Today Â· 18:00</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-700">Review Â· Linear algebra</span>
            <span className="text-slate-500">Tomorrow Â· 09:00</span>
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-4 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">
                Smart suggestions
              </div>
              <div className="text-xs text-slate-500">
                AI engine will adapt sessions based on focus trends.
              </div>
            </div>
            <span className="h-10 w-10 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
              AI
            </span>
          </div>

        </div>
      </div> */}

        </div>

      </div>


      {/* Dashboard Visual */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ===== STUDY TREND ===== */}
        <div className={dashboardCardClass}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={dashboardTitleClass}>
              Study Trend
            </h2>

            <div className={['flex items-center gap-4 text-xs', dashboardMutedTextClass].join(' ')}>
              <span className="flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-sky-500" />
                This week
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-4 rounded-full bg-slate-300" />
                Last week
              </span>
            </div>
          </div>

          <div className={['h-56 rounded-2xl p-4', isDark ? 'border border-slate-800 bg-slate-950/50' : 'border border-slate-200'].join(' ')}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendChartData}>
                <defs>
                  <linearGradient id="thisWeekFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="lastWeekFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="day" tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip formatter={(value) => [`${value} min`, '']} />
                <Area
                  type="monotone"
                  dataKey="lastWeek"
                  name="Last week"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  fill="url(#lastWeekFill)"
                />
                <Area
                  type="monotone"
                  dataKey="thisWeek"
                  name="This week"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  fill="url(#thisWeekFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className={ dashboardCardClass}>
          <div className=" items-center justify-between mb-6">
            <h2 className={dashboardTitleClass}>Weekday Consistency</h2>
          </div>

{/*     
          <div className={[' h-56 rounded-2xl p-4', isDark ? 'border border-slate-800 bg-slate-950/50' : 'border border-slate-200'].join(' ')}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={weekdayConsistencyData} outerRadius="75%">
                <defs>
                  <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />

                <PolarAngleAxis
                  dataKey="day"
                  tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }}
                />

                <PolarRadiusAxis
                  tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value} min`, "Avg per session"]}
                />

                <Radar
                  dataKey="avgMinutes"
                  stroke="#6366f1"
                  fill="url(#radarGradient)"
                  fillOpacity={0.5}
                />
              </RadarChart>


            </ResponsiveContainer>


          </div> */}

  
                  <div
                      className={[
                          'rounded-2xl p-4 flex items-center gap-6',
                          isDark
                              ? 'border border-slate-800 bg-slate-950/50'
                              : 'border border-slate-200 bg-white',
                      ].join(' ')}
                  >
                      {/* LEFT – Radar Chart */}
                      <div className="flex-1 h-56">
                          <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={weekdayConsistencyData} outerRadius="75%">
                                  <defs>
                                      <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                                          <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.7} />
                                      </linearGradient>
                                  </defs>

                                  <PolarGrid stroke={isDark ? "#334155" : "#e2e8f0"} />

                                  <PolarAngleAxis
                                      dataKey="day"
                                      tick={{ fill: isDark ? "#cbd5e1" : "#475569", fontSize: 12 }}
                                  />

                                  <PolarRadiusAxis
                                      tick={{ fill: isDark ? "#94a3b8" : "#64748b", fontSize: 11 }}
                                  />

                                  <Tooltip
                                      contentStyle={{
                                          backgroundColor: isDark ? "#0f172a" : "#ffffff",
                                          border: "1px solid #e2e8f0",
                                          borderRadius: "12px",
                                          fontSize: "12px",
                                      }}
                                      formatter={(value) => [`${value} min`, "Avg per session"]}
                                  />

                                  <Radar
                                      dataKey="avgMinutes"
                                      stroke="#6366f1"
                                      fill="url(#radarGradient)"
                                      fillOpacity={0.5}
                                  />
                              </RadarChart>
                          </ResponsiveContainer>
                      </div>

                      {/* RIGHT – Illustration */}
                      <div className="hidden lg:flex items-center justify-center">
                        
                          {/* <img
                              src={WeekDaysImg}
                              alt="Weekdays"
                              className="w-32 h-auto opacity-70"
                          /> */}
                          <img
                              src={WeekDaysImg}
                              alt="Weekdays"
                              className={[
                                  "w-32 h-auto transition-opacity duration-300",
                                  isDark ? "opacity-30" : "opacity-80"
                              ].join(" ")}
                          />

                      </div>
                  </div>

            
        </div>
      </div>

      {/* Dashboard Rewards Section */}
      <div className={dashboardCardClass}>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {/* <ListTodo className="h-5 w-5 text-indigo-500" /> */}
            <img
              src={RewLogo}
              alt="Rewards"
              className={[
                "w-16 h-auto transition-opacity duration-300 bsolute top-0 right-20  max-sm:top-0 ",
                isDark ? "opacity-80" : "opacity-90"
              ].join(" ")}
            />

          <h2 className={dashboardTitleClass}>Rewards</h2>
          </div>



          <span className={[
            "text-xs font-medium px-3 py-1 rounded-full",
            isDark
              ? "bg-slate-800 text-slate-300"
              : "bg-slate-100 text-slate-600"
          ].join(" ")}>
            {rewardBadges.filter((reward) => reward.unlocked).length}/
            {rewardBadges.length || TIME_BADGES.length}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

          {rewardBadges.map((reward) => (

            <div
              key={reward.key}
              className={[
                "relative rounded-3xl border p-5 transition-all duration-300 overflow-hidden",
                reward.unlocked
                  ? isDark
                    ? "border-amber-500/40 bg-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.15)]"
                    : "border-amber-300 bg-white shadow-sm"
                  : isDark
                    ? "border-slate-700 bg-slate-900"
                    : "border-slate-200 bg-slate-50"
              ].join(" ")}
            >

              {/* Subtle glow for unlocked */}
              {reward.unlocked && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-rose-400/10 pointer-events-none" />
              )}

              <div className="relative flex items-start gap-4">

                {/* Badge Icon */}
                <div className={[
                  "h-16 w-16 rounded-lg flex items-center justify-center shrink-0 border transition",
                  reward.unlocked
                    ? isDark
                      ? "border-amber-500/50 bg-slate-800"
                      : "border-amber-300 bg-amber-50"
                    : isDark
                      ? "border-slate-700 bg-slate-800"
                      : "border-slate-200 bg-white"
                ].join(" ")}>
                  {REWARD_ICONS[reward.key] && (
                    <img
                      src={REWARD_ICONS[reward.key]}
                      alt={`${reward.label} badge`}
                      className={[
                        "h-14 w-14 object-contain transition-all duration-300 rounded-lg",
                        reward.unlocked
                          ? "opacity-100"
                          : "opacity-40 grayscale"
                      ].join(" ")}
                    />
                  )}
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0 space-y-1">

                  <div className={[
                    "text-sm font-semibold",
                    reward.unlocked
                      ? isDark
                        ? "text-amber-300"
                        : "text-amber-700"
                      : isDark
                        ? "text-slate-200"
                        : "text-slate-800"
                  ].join(" ")}>
                    {reward.label}
                  </div>

                  <div className={["text-xs", dashboardMutedTextClass].join(" ")}>
                    {reward.description}
                  </div>

                  <div className={["text-[11px] mt-1", dashboardMutedTextClass].join(" ")}>
                    Unlocked {reward.unlockCount} {reward.unlockCount === 1 ? "time" : "times"}
                  </div>

                </div>

              </div>

              {/* Status Pill */}
              <div className="mt-4">
                <span
                  className={[
                    "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                    reward.unlocked
                      ? isDark
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-amber-100 text-amber-700"
                      : isDark
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-200 text-slate-600"
                  ].join(" ")}
                >
                  {reward.unlocked ? "Achievement unlocked" : "Locked"}
                </span>
              </div>

            </div>

          ))}

        </div>
      </div>

      {/* Todo  */}
      {/* Quick Todo */}
      <div className={dashboardCardClass}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-indigo-500" />
            <h2 className={dashboardTitleClass}>Quick Todo</h2>
          </div>

          <span className={['text-xs font-medium', dashboardMutedTextClass].join(' ')}>
            {todoItems.filter((item) => item.done).length}/{todoItems.length}
          </span>
        </div>

        {/* Add Form */}
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-5">

          <div className="relative flex-1">
            <input
              type="text"
              value={todoInput}
              onChange={(event) => setTodoInput(event.target.value)}
              placeholder="Add a task..."
              className={[
                'w-full rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition',
                isDark
                  ? 'bg-slate-950 border border-slate-700 text-slate-100 placeholder:text-slate-500'
                  : 'bg-white border border-slate-300 text-slate-800 placeholder:text-slate-400'
              ].join(' ')}
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 text-white px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
          >
            <Plus className="h-4 w-4" />
          </button>

        </form>

        {/* Todo List */}
        <div className="space-y-3">

          {todoItems.length === 0 ? (
            <div className={[
              'rounded-2xl border px-4 py-6 text-sm text-center',
              isDark
                ? 'border-slate-700 bg-slate-900 text-slate-500'
                : 'border-slate-200 bg-slate-50 text-slate-500'
            ].join(' ')}>
              Nothing planned yet.
            </div>
          ) : (

            todoItems.map((item) => (
              <div
                key={item.id}
                className={[
                  'group rounded-2xl border px-4 py-3 flex items-center justify-between transition',
                  isDark
                    ? 'border-slate-700 bg-slate-900 hover:bg-slate-800'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                ].join(' ')}
              >

                {/* Left side */}
                <button
                  type="button"
                  onClick={() => handleToggleTodo(item.id)}
                  className="flex items-center gap-3 flex-1 text-left"
                >

                  {/* Checkbox */}
                  <div className={[
                    'h-8 w-8 flex items-center justify-center rounded-full border transition',
                    item.done
                      ? 'bg-green-400 border-white'
                      : isDark
                        ? 'border-slate-600 bg-slate-950'
                        : 'border-slate-300 bg-white'
                  ].join(' ')}>
                    {item.done && (
                      <Check className="h-3 w-3 text-white" />
                    )}
                  </div>

                  {/* Title */}
                  <span
                    className={[
                      'text-sm font-medium transition',
                      item.done
                        ? isDark
                          ? 'text-slate-500 line-through'
                          : 'text-slate-400 line-through'
                        : isDark
                          ? 'text-slate-200'
                          : 'text-slate-800'
                    ].join(' ')}
                  >
                    {item.title}
                  </span>

                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteTodo(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="h-6 w-6" />
                </button>

              </div>
            ))

          )}
        </div>

      </div>



    </div>

  )
}




export default DashboardPlaceholder
