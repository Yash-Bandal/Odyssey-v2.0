import { REWARD_ICONS } from '../../constants/rewards'

function RewardCard({ reward, isDark = false, rewardsTitleClass, rewardsMutedClass }) {
  const unlocked = reward.unlocked
  const rewardIcon = REWARD_ICONS[reward.key]

  return (
    <article
      className={[
        'relative rounded-3xl border p-6 transition-all duration-300 overflow-hidden',
        unlocked
          ? isDark
            ? 'bg-slate-900 border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
            : 'bg-white border-amber-300 shadow-md'
          : isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-slate-50 border-slate-200',
      ].join(' ')}
    >
      {unlocked && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 via-transparent to-rose-400/10 pointer-events-none" />
      )}

      <div className="relative flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div
            className={[
              'h-20 w-20 shrink-0 rounded-lg flex items-center justify-center border transition-all',
              unlocked
                ? isDark
                  ? 'border-amber-500/50 bg-slate-800'
                  : 'border-amber-300 bg-amber-50'
                : isDark
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-white',
            ].join(' ')}
          >
            {rewardIcon ? (
              <img
                src={rewardIcon}
                alt={`${reward.title} badge`}
                className={[
                  'h-16 w-16 object-contain transition-all duration-300 rounded-lg',
                  unlocked ? 'opacity-100 scale-110' : 'opacity-40 grayscale',
                ].join(' ')}
              />
            ) : (
              <span className="text-xs font-semibold text-slate-400">Badge</span>
            )}
          </div>

          <span
            className={[
              'inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
              unlocked
                ? isDark
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-amber-100 text-amber-700'
                : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-200 text-slate-600',
            ].join(' ')}
          >
            {unlocked ? 'Achievement unlocked' : 'Locked'}
          </span>
        </div>

        <div>
          <h3
            className={[
              'text-base font-semibold',
              unlocked
                ? isDark
                  ? 'text-amber-300'
                  : 'text-amber-700'
                : rewardsTitleClass,
            ].join(' ')}
          >
            {reward.title}
          </h3>

          <p className={['mt-1 text-sm', rewardsMutedClass].join(' ')}>
            {reward.subtitle}
          </p>

          <div className={['mt-3 text-md', rewardsMutedClass].join(' ')}>
            Unlocked {reward.unlockCount} {reward.unlockCount === 1 ? 'time' : 'times'}
          </div>
        </div>
      </div>
    </article>
  )
}

export default RewardCard
