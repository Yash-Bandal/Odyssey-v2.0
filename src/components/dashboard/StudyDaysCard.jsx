function StudyDaysCard({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  dashboardMutedTextClass,
  dashboardStrongTextClass,
  ActivityImg,
  summary,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className="flex items-center justify-between mb-10 relative ">
        <h2 className={dashboardTitleClass}>Study Days</h2>

        <img
          src={ActivityImg}
          alt="Activity"
          className={[
            'w-24 h-auto transition-opacity duration-300 absolute top-0 right-20  max-sm:top-0 ',
            isDark ? 'opacity-20' : 'opacity-70',
          ].join(' ')}
        />

        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-semibold">
          On track
        </span>
      </div>

      <div className="space-y-4 text-sm ">
        <div className="flex items-baseline justify-between">
          <span className={dashboardMutedTextClass}>Semester Goal</span>
          <span className={dashboardStrongTextClass}>{summary.semesterTotalHours} h</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={dashboardMutedTextClass}>Completed</span>
          <span className={dashboardStrongTextClass}>{summary.semesterStudiedHours.toFixed(1)} h</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={dashboardMutedTextClass}>Remaining Hours</span>
          <span className={dashboardStrongTextClass}>{summary.semesterRemainingHours.toFixed(2)} h</span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className={dashboardMutedTextClass}>Remaining Days</span>
          <span className={dashboardStrongTextClass}>{summary.semesterRemainingDays}</span>
        </div>

        <div className="flex items-baseline justify-between border-t pt-4">
          <span className={dashboardMutedTextClass}>Required Daily Pace</span>
          <span className="font-semibold text-sky-500">
            {summary.semesterRequiredDailyHours.toFixed(2)} h/day
          </span>
        </div>
      </div>
    </div>
  )
}

export default StudyDaysCard
