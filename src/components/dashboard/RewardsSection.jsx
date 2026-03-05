import { REWARD_ICONS, TIME_BADGES } from '../../constants/rewards'

function RewardsSection({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  dashboardMutedTextClass,
  rewardBadges,
  unlockedRewardCount,
  RewLogo,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <img
            src={RewLogo}
            alt="Rewards"
            className={[
              'w-16 h-auto transition-opacity duration-300 bsolute top-0 right-20  max-sm:top-0 ',
              isDark ? 'opacity-80' : 'opacity-90',
            ].join(' ')}
          />

          <h2 className={dashboardTitleClass}>Rewards</h2>
        </div>

        <span
          className={[
            'text-xs font-medium px-3 py-1 rounded-full',
            isDark
              ? 'bg-slate-800 text-slate-300'
              : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {unlockedRewardCount}/{rewardBadges.length || TIME_BADGES.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {rewardBadges.map((reward) => (
          <div
            key={reward.key}
            className={[
              'relative rounded-3xl border p-5 transition-all duration-300 overflow-hidden',
              reward.unlocked
                ? isDark
                  ? 'border-amber-500/40 bg-slate-900 shadow-[0_0_18px_rgba(251,191,36,0.15)]'
                  : 'border-amber-300 bg-white shadow-sm'
                : isDark
                  ? 'border-slate-700 bg-slate-900'
                  : 'border-slate-200 bg-slate-50',
            ].join(' ')}
          >
            {reward.unlocked && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-rose-400/10 pointer-events-none" />
            )}

            <div className="relative flex items-start gap-4">
              <div
                className={[
                  'h-16 w-16 rounded-lg flex items-center justify-center shrink-0 border transition',
                  reward.unlocked
                    ? isDark
                      ? 'border-amber-500/50 bg-slate-800'
                      : 'border-amber-300 bg-amber-50'
                    : isDark
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-slate-200 bg-white',
                ].join(' ')}
              >
                {REWARD_ICONS[reward.key] && (
                  <img
                    src={REWARD_ICONS[reward.key]}
                    alt={`${reward.label} badge`}
                    className={[
                      'h-14 w-14 object-contain transition-all duration-300 rounded-lg',
                      reward.unlocked
                        ? 'opacity-100'
                        : 'opacity-40 grayscale',
                    ].join(' ')}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div
                  className={[
                    'text-sm font-semibold',
                    reward.unlocked
                      ? isDark
                        ? 'text-amber-300'
                        : 'text-amber-700'
                      : isDark
                        ? 'text-slate-200'
                        : 'text-slate-800',
                  ].join(' ')}
                >
                  {reward.label}
                </div>

                <div className={['text-xs', dashboardMutedTextClass].join(' ')}>
                  {reward.description}
                </div>

                <div className={['text-[11px] mt-1', dashboardMutedTextClass].join(' ')}>
                  Unlocked {reward.unlockCount} {reward.unlockCount === 1 ? 'time' : 'times'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span
                className={[
                  'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
                  reward.unlocked
                    ? isDark
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-amber-100 text-amber-700'
                    : isDark
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-600',
                ].join(' ')}
              >
                {reward.unlocked ? 'Achievement unlocked' : 'Locked'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RewardsSection
