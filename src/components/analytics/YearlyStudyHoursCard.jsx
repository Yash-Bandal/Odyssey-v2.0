import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

function YearlyStudyHoursCard({
  loading,
  monthlyData,
  analyticsCardClass,
  analyticsTitleClass,
  analyticsMutedClass,
  analyticsGridStroke,
  analyticsTick,
  mode,
  isDark,
}) {
  return (
    <section className={analyticsCardClass}>
      {/* <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Yearly Study Hours (Jan-Dec)</h2> */}
    <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>
        {mode === 'global' ? 'Yearly Study Hours (All Time)' : 'Yearly Study Hours'}
      </h2>

      {/* <p className="text-sm text-slate-500">
        {mode === 'global'
          ? 'Showing insights across all semesters'
          : 'Showing insights for current semester'}
      </p> */}
      <div className="h-72">
        {loading ? (
          <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
              <XAxis dataKey="month" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              {/* <Tooltip formatter={(value) => [`${value} h`, 'Total']} /> */}

                <Tooltip
                  formatter={(value) => [`${value} h`, 'Total']}
                  contentStyle={{
                    backgroundColor: isDark ? '#020617' : '#ffffff',
                    border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    padding: '8px 12px',
                  }}
                  labelStyle={{
                    color: isDark ? '#f1f5f9' : '#0f172a',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                  itemStyle={{
                    color: isDark ? '#94a3b8' : '#475569',
                    fontSize: '12px',
                  }}
                  cursor={{
                    fill: isDark
                      ? 'rgba(148,163,184,0.08)'   // subtle light overlay
                      : 'rgba(0,0,0,0.04)',        // subtle dark overlay
                  }}
                />

                
              <Bar dataKey="hours" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default YearlyStudyHoursCard
