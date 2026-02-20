import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { REWARD_ICONS } from '../constants/rewards'
import { toLocalDateKey } from '../utils/date'
import { computeAndUpdateRewards } from "../utils/rewardEngine"

function RewardsPage({ user, semester, sessionsVersion, isDark = false }) {
  const [loading, setLoading] = useState(true)
  const [timingRewards, setTimingRewards] = useState([])
  const [timeRewards, setTimeRewards] = useState([])
  const [streakRewards, setStreakRewards] = useState([])

  // useEffect(() => {
   
  //   load()
  // }, [user.id, semester.id, sessionsVersion])

  //===================================================
  //rewardEngine
  useEffect(() => {
    const load = async () => {
      setLoading(true)

      try {
        const result = await computeAndUpdateRewards({
          user,
          semester,
          supabase,
        })

        console.log("Reward engine result:", result)

        if (!result) {
          setTimingRewards([])
          setTimeRewards([])
          setStreakRewards([])
          setLoading(false)
          return
        }

        setTimingRewards(result.timing)
        setTimeRewards(result.time)
        setStreakRewards(result.streak)
        setLoading(false)

      } catch (err) {
        console.error("Reward engine crashed:", err)
        setLoading(false)
      }
    }

    load()
  }, [user.id, semester.id, sessionsVersion])

  //======================================================

  const allRewards = [...timingRewards, ...timeRewards, ...streakRewards]
  const unlockedCount = allRewards.filter((reward) => reward.unlocked).length
  const rewardsCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
  const rewardsTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const rewardsMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'

  //==================================================================

    /* =============================
       Reward Card Component
    ============================== */

    const renderRewardCard = (reward) => {
      const unlocked = reward.unlocked
      const rewardIcon = REWARD_ICONS[reward.key]

      return (
        <article
          key={reward.key}
          className={[
            "relative rounded-3xl border p-6 transition-all duration-300 overflow-hidden",
            unlocked
              ? isDark
                ? "bg-slate-900 border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                : "bg-white border-amber-300 shadow-md"
              : isDark
                ? "bg-slate-900 border-slate-800"
                : "bg-slate-50 border-slate-200"
          ].join(" ")}
        >

          {/* Glow overlay for unlocked */}
          {unlocked && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-rose-400/10 pointer-events-none" />
          )}

          <div className="relative flex flex-col gap-5">

            {/* Top Row */}
            <div className="flex items-start justify-between gap-4">

              {/* Icon */}
              <div className={[
                "h-20 w-20 shrink-0 rounded-lg flex items-center justify-center border transition-all",
                unlocked
                  ? isDark
                    ? "border-amber-500/50 bg-slate-800"
                    : "border-amber-300 bg-amber-50"
                  : isDark
                    ? "border-slate-700 bg-slate-800"
                    : "border-slate-200 bg-white"
              ].join(" ")}>

                {rewardIcon ? (
                  <img
                    src={rewardIcon}
                    alt={`${reward.title} badge`}
                    className={[
                      "h-16 w-16 object-contain transition-all duration-300 rounded-lg",
                      unlocked
                        ? "opacity-100 scale-110"
                        : "opacity-40 grayscale"
                    ].join(" ")}
                  />
                ) : (
                  <span className="text-xs font-semibold text-slate-400">
                    Badge
                  </span>
                )}
              </div>

              {/* Status */}
              <span
                className={[
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide",
                  unlocked
                    ? isDark
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-amber-100 text-amber-700"
                    : isDark
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-200 text-slate-600"
                ].join(" ")}
              >
                {unlocked ? "Achievement unlocked" : "Locked"}
              </span>

            </div>

            {/* Text */}
            <div>
              <h3 className={[
                "text-base font-semibold",
                unlocked
                  ? isDark
                    ? "text-amber-300"
                    : "text-amber-700"
                  : rewardsTitleClass
              ].join(" ")}>
                {reward.title}
              </h3>

              <p className={["mt-1 text-sm", rewardsMutedClass].join(" ")}>
                {reward.subtitle}
              </p>

              <div className={["mt-3 text-md", rewardsMutedClass].join(" ")}>
                Unlocked {reward.unlockCount} {reward.unlockCount === 1 ? "time" : "times"}
              </div>
            </div>

          </div>
        </article>
      )
    }

    /* =============================
       Page Layout
    ============================== */

    return (
      <div className="space-y-8">

        {/* HEADER */}
        <div className={rewardsCardClass}>

          <div className="flex items-center justify-between flex-wrap gap-6">

            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
                Rewards
              </div>

              <div className={["mt-2 text-3xl font-bold tracking-tight", rewardsTitleClass].join(" ")}>
                Achievement Badges
              </div>

              <div className={["mt-2 text-sm max-w-xl", rewardsMutedClass].join(" ")}>
                Consistency compounds. Unlock milestones by staying disciplined and focused.
              </div>
            </div>

            <div className={[
              "inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold",
              isDark
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-700"
            ].join(" ")}>
              {unlockedCount} / {allRewards.length}
            </div>

          </div>
        </div>

        {loading ? (
          <div className={rewardsCardClass}>
            <div className={["text-sm", rewardsMutedClass].join(" ")}>
              Loading rewards...
            </div>
          </div>
        ) : (
          <>
            {/* Timing */}
            <section className={rewardsCardClass}>
              <h2 className={["text-xl font-semibold mb-6 tracking-tight", rewardsTitleClass].join(" ")}>
                Test Your Will Power
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {timingRewards.map(renderRewardCard)}
              </div>
            </section>

            {/* Daily Time */}
            <section className={rewardsCardClass}>
              <h2 className={["text-xl font-semibold mb-6 tracking-tight", rewardsTitleClass].join(" ")}>
                Daily Time Badges
              </h2>
              {/* <p>How Long Can You Stay Up?</p> */}

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {timeRewards.map(renderRewardCard)}
              </div>
            </section>

            {/* Streak */}
            <section className={rewardsCardClass}>
              <h2 className={["text-xl font-semibold mb-6 tracking-tight", rewardsTitleClass].join(" ")}>
                Streak Milestones
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {streakRewards.map(renderRewardCard)}
              </div>
            </section>
          </>
        )}
      </div>
    )
  }

  export default RewardsPage
