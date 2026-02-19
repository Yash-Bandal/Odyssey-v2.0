import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { REWARD_ICONS } from '../constants/rewards'
import { toLocalDateKey } from '../utils/date'

function RewardsPage({ user, semester, sessionsVersion, isDark = false }) {
  const [loading, setLoading] = useState(true)
  const [timingRewards, setTimingRewards] = useState([])
  const [timeRewards, setTimeRewards] = useState([])
  const [streakRewards, setStreakRewards] = useState([])

  useEffect(() => {
    const dailyTimingDefs = [
      { key: 'early_bird', title: 'Early Bird', subtitle: 'First session starts before 7:00 AM', badge: 'EB', color: 'from-amber-400 to-orange-500' },
      { key: 'night_owl', title: 'Night Owl', subtitle: 'Any session starts after 11:00 PM', badge: 'NO', color: 'from-indigo-500 to-blue-600' },
    ]
    const dailyTimeDefs = [
      { key: '2_hours', title: '2 Hours', threshold: 120, badge: '2H', color: 'from-sky-500 to-cyan-500' },
      { key: '4_hours', title: '4 Hours', threshold: 240, badge: '4H', color: 'from-sky-500 to-cyan-500' },
      { key: '6_hours', title: '6 Hours', threshold: 360, badge: '6H', color: 'from-sky-500 to-cyan-500' },
      { key: '8_hours', title: '8 Hours', threshold: 480, badge: '8H', color: 'from-sky-500 to-cyan-500' },
      { key: '10_hours', title: '10 Hours', threshold: 600, badge: '10H', color: 'from-sky-500 to-cyan-500' },
      { key: '12_hours', title: '12 Hours', threshold: 720, badge: '12H', color: 'from-sky-500 to-cyan-500' },
    ]
    const streakDefs = [
      { key: '7_day_streak', title: '7 Day Streak', threshold: 7, badge: 'S7', color: 'from-emerald-500 to-teal-500' },
      { key: '30_day_streak', title: '30 Day Streak', threshold: 30, badge: 'S30', color: 'from-emerald-500 to-teal-500' },
      { key: '100_day_streak', title: '100 Day Streak', threshold: 100, badge: 'S100', color: 'from-emerald-500 to-teal-500' },
    ]

    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('sessions')
        .select('start_time, end_time, duration_minutes, type')
        .eq('user_id', user.id)
        .eq('semester_id', semester.id)
        .order('start_time', { ascending: true })
        .limit(5000)

      if (error || !data) {
        setTimingRewards([])
        setTimeRewards([])
        setStreakRewards([])
        setLoading(false)
        return
      }

      const todayKey = toLocalDateKey(new Date())
      let todayMinutes = 0
      let nightOwlToday = false
      const todayStarts = []
      const pomodoroDayKeys = new Set()

      data.forEach((session) => {
        const start = new Date(session.start_time)
        const end = new Date(session.end_time || session.start_time)
        const minutes = Number(session.duration_minutes) || 0

        if (toLocalDateKey(start) === todayKey) {
          todayMinutes += minutes
          todayStarts.push(start)
          if (start.getHours() >= 23) {
            nightOwlToday = true
          }
        }

        if (session.type === 'pomodoro') {
          const streakKey = toLocalDateKey(end)
          if (streakKey) {
            pomodoroDayKeys.add(streakKey)
          }
        }
      })

      let streakDays = 0
      if (pomodoroDayKeys.size > 0) {
        const cursor = new Date()
        for (;;) {
          const key = toLocalDateKey(cursor)
          if (!pomodoroDayKeys.has(key)) {
            break
          }
          streakDays += 1
          cursor.setDate(cursor.getDate() - 1)
        }
      }

      const firstTodayStart =
        todayStarts.length > 0 ? new Date(Math.min(...todayStarts.map((d) => d.getTime()))) : null

      const dailyConditions = {
        early_bird: Boolean(firstTodayStart && firstTodayStart.getHours() < 7),
        night_owl: nightOwlToday,
        '2_hours': todayMinutes >= 120,
        '4_hours': todayMinutes >= 240,
        '6_hours': todayMinutes >= 360,
        '8_hours': todayMinutes >= 480,
        '10_hours': todayMinutes >= 600,
        '12_hours': todayMinutes >= 720,
      }
      const streakConditions = {
        '7_day_streak': streakDays >= 7,
        '30_day_streak': streakDays >= 30,
        '100_day_streak': streakDays >= 100,
      }

      const { data: existingRewards } = await supabase
        .from('user_rewards')
        .select('reward_key, unlock_count, last_unlocked_date')
        .eq('user_id', user.id)

      const rewardsMap = new Map((existingRewards || []).map((row) => [row.reward_key, row]))
      const upsertTasks = []

      const buildDailyBadge = (def) => {
        const existing = rewardsMap.get(def.key)
        const currentCount = Number(existing?.unlock_count) || 0
        const lastDate = existing?.last_unlocked_date || null
        const unlockedToday = Boolean(dailyConditions[def.key])
        const nextCount = unlockedToday && lastDate !== todayKey ? currentCount + 1 : currentCount

        if (unlockedToday) {
          upsertTasks.push(
            supabase.from('user_rewards').upsert(
              {
                user_id: user.id,
                reward_key: def.key,
                unlock_count: nextCount,
                last_unlocked_date: todayKey,
              },
              { onConflict: 'user_id,reward_key' },
            ),
          )
        }

        return {
          key: def.key,
          title: def.title,
          subtitle: def.subtitle,
          badge: def.badge,
          color: def.color,
          unlocked: unlockedToday,
          unlockCount: nextCount,
        }
      }

      const nextTiming = dailyTimingDefs.map(buildDailyBadge)
      const nextTime = dailyTimeDefs.map((def) =>
        buildDailyBadge({
          ...def,
          subtitle: `${def.threshold}+ minutes today`,
        }),
      )

      const nextStreak = streakDefs.map((def) => {
        const existing = rewardsMap.get(def.key)
        const currentCount = Number(existing?.unlock_count) || 0
        const alreadyUnlocked = currentCount > 0
        const conditionMet = Boolean(streakConditions[def.key])

        if (conditionMet && !alreadyUnlocked) {
          upsertTasks.push(
            supabase.from('user_rewards').upsert(
              {
                user_id: user.id,
                reward_key: def.key,
                unlock_count: 1,
                last_unlocked_date: todayKey,
              },
              { onConflict: 'user_id,reward_key' },
            ),
          )
        }

        return {
          key: def.key,
          title: def.title,
          subtitle: `${def.threshold} consecutive Pomodoro days`,
          badge: def.badge,
          color: def.color,
          unlocked: conditionMet || alreadyUnlocked,
          unlockCount: conditionMet && !alreadyUnlocked ? 1 : currentCount,
        }
      })

      if (upsertTasks.length) {
        await Promise.all(upsertTasks)
      }

      setTimingRewards(nextTiming)
      setTimeRewards(nextTime)
      setStreakRewards(nextStreak)
      setLoading(false)
    }

    load()
  }, [user.id, semester.id, sessionsVersion])

  const allRewards = [...timingRewards, ...timeRewards, ...streakRewards]
  const unlockedCount = allRewards.filter((reward) => reward.unlocked).length
  const rewardsCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
  const rewardsTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const rewardsMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'

  const renderRewardCard = (reward) => {
    const unlocked = reward.unlocked
    const rewardIcon = REWARD_ICONS[reward.key]
    return (
      <article
        key={reward.key}
        className={[
          'rounded-3xl border p-5 shadow-sm transition-all',
          unlocked
            ? isDark
              ? 'bg-slate-900 border-emerald-700/40 ring-1 ring-emerald-800/40'
              : 'bg-white border-emerald-200 ring-1 ring-emerald-100'
            : isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-slate-50 border-slate-200',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-4">
          <div className={['h-20 w-20 shrink-0 rounded-2xl border p-2.5 flex items-center justify-center', isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'].join(' ')}>
            {rewardIcon ? (
              <img
                src={rewardIcon}
                alt={`${reward.title} badge`}
                className={[
                  'h-full w-full object-contain rounded-lg transition-all duration-300',
                  unlocked ? 'scale-125 opacity-100' : 'scale-95 opacity-40 ',
                ].join(' ')}
              />
            ) : (
              <span className={['text-xs font-semibold', rewardsMutedClass].join(' ')}>Badge</span>
            )}
          </div>
          <span
            className={[
              'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
              unlocked
                ? isDark
                  ? 'bg-emerald-900/40 text-emerald-300'
                  : 'bg-emerald-50 text-emerald-700'
                : isDark
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-slate-200 text-slate-500',
            ].join(' ')}
          >
            {unlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>

        <h3 className={['mt-4 text-base font-semibold', rewardsTitleClass].join(' ')}>{reward.title}</h3>
        <p className={['mt-1 text-sm', rewardsMutedClass].join(' ')}>{reward.subtitle}</p>
        <div className={['mt-3 text-xs', rewardsMutedClass].join(' ')}>
          Unlocked {reward.unlockCount} {reward.unlockCount === 1 ? 'time' : 'times'}
        </div>
      </article>
    )
  }

  return (
    <div className="space-y-6">
      <div className={rewardsCardClass}>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Rewards</div>
        <div className={['mt-2 text-2xl font-semibold', rewardsTitleClass].join(' ')}>Achievement Badges</div>
        <div className={['mt-2 text-sm', rewardsMutedClass].join(' ')}>
          Unlock badges by consistency, timing, and total study effort.
        </div>
        <div className="mt-4 inline-flex items-center rounded-full bg-sky-50 text-sky-700 px-3 py-1 text-xs font-semibold">
          {unlockedCount} / {allRewards.length || 11} unlocked
        </div>
      </div>

      {loading ? (
        <div className={['rounded-3xl border shadow-sm p-8 text-sm', isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'].join(' ')}>
          Loading rewards...
        </div>
      ) : (
        <>
          <section className={rewardsCardClass}>
            <h2 className={['text-lg font-semibold mb-4', rewardsTitleClass].join(' ')}>Timing Rewards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {timingRewards.map(renderRewardCard)}
            </div>
          </section>

          <section className={rewardsCardClass}>
            <h2 className={['text-lg font-semibold mb-4', rewardsTitleClass].join(' ')}>Daily Time Badges</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {timeRewards.map(renderRewardCard)}
            </div>
          </section>

          <section className={rewardsCardClass}>
            <h2 className={['text-lg font-semibold mb-4', rewardsTitleClass].join(' ')}>Streak Rewards</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {streakRewards.map(renderRewardCard)}
            </div>
          </section>
        </>
      )}
    </div>
  )
}


export default RewardsPage
