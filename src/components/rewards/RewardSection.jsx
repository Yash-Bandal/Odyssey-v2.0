import RewardCard from './RewardCard'

function RewardSection({
  title,
  rewards,
  rewardsCardClass,
  rewardsTitleClass,
  rewardsMutedClass,
  isDark = false,
}) {
  return (
    <section className={rewardsCardClass}>
      <h2 className={['text-xl font-semibold mb-6 tracking-tight', rewardsTitleClass].join(' ')}>
        {title}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.key}
            reward={reward}
            isDark={isDark}
            rewardsTitleClass={rewardsTitleClass}
            rewardsMutedClass={rewardsMutedClass}
          />
        ))}
      </div>
    </section>
  )
}

export default RewardSection
