function RewardHeader({ rewardsCardClass, rewardsTitleClass, rewardsMutedClass, isDark = false, unlockedCount, totalCount }) {
  return (
    <div className={rewardsCardClass}>
      <div className="flex items-center justify-between flex-wrap gap-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-600">
            Rewards
          </div>

          <div className={['mt-2 text-3xl font-bold tracking-tight', rewardsTitleClass].join(' ')}>
            Achievement Badges
          </div>

          <div className={['mt-2 text-sm max-w-xl', rewardsMutedClass].join(' ')}>
            Consistency compounds. Unlock milestones by staying disciplined and focused.
          </div>
        </div>

        <div
          className={[
            'inline-flex items-center rounded-full px-5 py-2 text-sm font-semibold',
            isDark
              ? 'bg-slate-800 text-slate-300'
              : 'bg-slate-100 text-slate-700',
          ].join(' ')}
        >
          {unlockedCount} / {totalCount}
        </div>
      </div>
    </div>
  )
}

export default RewardHeader
