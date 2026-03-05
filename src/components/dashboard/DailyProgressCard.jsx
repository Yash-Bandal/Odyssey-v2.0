function DailyProgressCard({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  dashboardMutedTextClass,
  dashboardStrongTextClass,
  StudyTimeImg,
  circleRadius,
  circleCircumference,
  circleOffset,
  dailyTargetHours,
  progressPercent,
  todayHours,
  progressFraction,
  summary,
  formatHoursMinutes,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className="flex items-center justify-between mb-8 relative ">
        <h2 className={dashboardTitleClass}>Daily Progress</h2>

        <img
          src={StudyTimeImg}
          alt="Study time"
          className={[
            'w-32 h-auto transition-opacity absolute top-0 right-0 max-sm:top-10 max-sm:w-24',
            isDark ? 'opacity-20' : 'opacity-80',
          ].join(' ')}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10 sm:m-6">
        <div className="relative h-40 w-40 flex items-center justify-center">
          <svg className="h-38 w-38 -rotate-90" viewBox="0 0 40 40">
            <defs>
              <linearGradient id="goalGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#66f5a0" />
                <stop offset="60%" stopColor="#00e060" />
                <stop offset="100%" stopColor="#00b84d" />
              </linearGradient>
            </defs>

            <circle
              cx="20"
              cy="20"
              r={circleRadius}
              fill="none"
              stroke={isDark ? '#1e293b' : '#e2e8f0'}
              strokeWidth="4"
            />

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
                filter: 'drop-shadow(0px 0px 8px rgba(0,224,96,0.35))',
              }}
            />
          </svg>

          <div className="absolute  inset-0 flex flex-col items-center justify-center">
            <div
              className={[
                'text-3xl sm:text-4xl font-bold',
                isDark ? 'text-white' : 'text-black',
              ].join(' ')}
            >
              {dailyTargetHours ? `${progressPercent}%` : '—'}
            </div>

            <div className="text-xs text-slate-500 tracking-wide">Daily Progress</div>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className={`text-xl sm:text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            {dailyTargetHours
              ? `${todayHours.toFixed(1)}h / ${dailyTargetHours.toFixed(1)}h`
              : 'Set semester goal'}
          </div>

          <div className={`text-sm ${dashboardMutedTextClass}`}>
            {dailyTargetHours
              ? progressFraction >= 1
                ? 'Target achieved. Extra hours compound.'
                : progressFraction >= 0.7
                  ? "You're close. Finish strong."
                  : progressFraction >= 0.3
                    ? 'Good momentum. Stay locked in.'
                    : 'Start strong. Momentum builds focus.'
              : 'Daily target is derived from semester configuration.'}
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="space-y-1">
              <div className={dashboardMutedTextClass}>Today</div>
              <div className={`text-lg font-semibold ${dashboardStrongTextClass}`}>
                {formatHoursMinutes(summary.todayMinutes)}
              </div>
            </div>

            <div className="space-y-1">
              <div className={dashboardMutedTextClass}>Total sessions</div>
              <div className={`text-lg font-semibold ${dashboardStrongTextClass}`}>
                {summary.totalSessions}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyProgressCard
