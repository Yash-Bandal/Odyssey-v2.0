import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts'

function WeekdayConsistencyCard({
  isDark,
  dashboardCardClass,
  dashboardTitleClass,
  weekdayConsistencyData,
  WeekDaysImg,
}) {
  return (
    <div className={dashboardCardClass}>
      <div className=" items-center justify-between mb-6">
        <h2 className={dashboardTitleClass}>Weekday Consistency</h2>
      </div>

      <div
        className={[
          'rounded-2xl p-4 flex items-center gap-6',
          isDark
            ? 'border border-slate-800 bg-slate-950/50'
            : 'border border-slate-200 bg-white',
        ].join(' ')}
      >
        <div className="flex-1 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={weekdayConsistencyData} outerRadius="75%">
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.7} />
                </linearGradient>
              </defs>

              <PolarGrid stroke={isDark ? '#334155' : '#e2e8f0'} />

              <PolarAngleAxis
                dataKey="day"
                tick={{ fill: isDark ? '#cbd5e1' : '#475569', fontSize: 12 }}
              />

              <PolarRadiusAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value) => [`${value} min`, 'Avg per session']}
              />

              <Radar
                dataKey="avgMinutes"
                stroke="#6366f1"
                fill="url(#radarGradient)"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="hidden lg:flex items-center justify-center">
          <img
            src={WeekDaysImg}
            alt="Weekdays"
            className={[
              'w-32 h-auto transition-opacity duration-300',
              isDark ? 'opacity-30' : 'opacity-80',
            ].join(' ')}
          />
        </div>
      </div>
    </div>
  )
}

export default WeekdayConsistencyCard
