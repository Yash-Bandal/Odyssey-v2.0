import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

function StudyTrendCard({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  dashboardMutedTextClass,
  trendView,
  setTrendView,
  trendChartData,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className={dashboardTitleClass}>Study Trend</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex rounded-xl border overflow-hidden text-xs w-fit">
            <button
              onClick={() => setTrendView('week')}
              className={`px-4 py-1 transition ${trendView === 'week'
                ? 'bg-sky-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
                }`}
            >
              Week
            </button>
            <button
              onClick={() => setTrendView('month')}
              className={`px-4 py-1 transition ${trendView === 'month'
                ? 'bg-sky-500 text-white'
                : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-600'
                }`}
            >
              Month
            </button>
          </div>

          <div
            className={[
              'flex items-center gap-4 text-xs flex-wrap',
              dashboardMutedTextClass,
            ].join(' ')}
          >
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-full bg-sky-500" />
              Current
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded-full bg-slate-300" />
              Previous
            </span>
          </div>
        </div>
      </div>

      <div className={['h-56 rounded-2xl p-4', isDark ? 'border border-slate-800 bg-slate-950/50' : 'border border-slate-200'].join(' ')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendChartData}>
            <defs>
              <linearGradient id="thisWeekFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="lastWeekFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
            <XAxis dataKey="label" tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: isDark ? '#cbd5e1' : '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
            {/* <Tooltip formatter={(value) => [`${value} min`, '']} /> */}

            <Tooltip
              formatter={(value) => [`${value} min`, '']}
              contentStyle={{
                backgroundColor: isDark ? '#020617' : '#ffffff', // dark: slate-950
                border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
              labelStyle={{
                color: isDark ? '#e2e8f0' : '#0f172a', // text color
                fontWeight: 600,
              }}
              itemStyle={{
                color: isDark ? '#cbd5e1' : '#334155',
                fontSize: '12px',
              }}
              cursor={{
                stroke: isDark ? '#475569' : '#cbd5f5',
                strokeWidth: 1,
              }}
            />

            
            <Area
              type="monotone"
              dataKey="previous"
              name="Last wee/month"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="url(#lastWeekFill)"
            />
            <Area
              type="monotone"
              dataKey="current"
              name="This wee/month"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              fill="url(#thisWeekFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default StudyTrendCard
