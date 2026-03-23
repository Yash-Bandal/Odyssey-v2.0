import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

function Last30DaysCard({
  loading,
  dailyData,
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
      {/* <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Last 30 Days</h2> */}
      <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>
        {mode === 'global' ? 'Recent 30-Day Activity' : 'Last 30 Days'}
      </h2>

      <div className="h-72">
        {loading ? (
          <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="analyticsAreaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
              <XAxis dataKey="day" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  formatter={(value) => [`${value} min`, 'Study time']}
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
                />
              <Area type="monotone" dataKey="minutes" stroke="#0284c7" strokeWidth={2.5} fill="url(#analyticsAreaFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default Last30DaysCard
