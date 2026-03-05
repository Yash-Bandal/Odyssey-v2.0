import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { computeAndUpdateRewards } from "../utils/rewardEngine"
import RewardHeader from '../components/rewards/RewardHeader'
import RewardSection from '../components/rewards/RewardSection'

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

    return (
      <div className="space-y-8">
        <RewardHeader
          rewardsCardClass={rewardsCardClass}
          rewardsTitleClass={rewardsTitleClass}
          rewardsMutedClass={rewardsMutedClass}
          isDark={isDark}
          unlockedCount={unlockedCount}
          totalCount={allRewards.length}
        />

        {loading ? (
          <div className={rewardsCardClass}>
            <div className={["text-sm", rewardsMutedClass].join(" ")}>
              Loading rewards...
            </div>
          </div>
        ) : (
          <>
            <RewardSection
              title="Test Your Will Power"
              rewards={timingRewards}
              rewardsCardClass={rewardsCardClass}
              rewardsTitleClass={rewardsTitleClass}
              rewardsMutedClass={rewardsMutedClass}
              isDark={isDark}
            />

            <RewardSection
              title="Daily Time Badges"
              rewards={timeRewards}
              rewardsCardClass={rewardsCardClass}
              rewardsTitleClass={rewardsTitleClass}
              rewardsMutedClass={rewardsMutedClass}
              isDark={isDark}
            />

            <RewardSection
              title="Streak Milestones"
              rewards={streakRewards}
              rewardsCardClass={rewardsCardClass}
              rewardsTitleClass={rewardsTitleClass}
              rewardsMutedClass={rewardsMutedClass}
              isDark={isDark}
            />
          </>
        )}
      </div>
    )
  }

  export default RewardsPage
