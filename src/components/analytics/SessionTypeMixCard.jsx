import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

function SessionTypeMixCard({ loading, isDark, typeData, analyticsCardClass, analyticsTitleClass, analyticsMutedClass }) {
  return (
    <section className={analyticsCardClass}>
      <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Session Type Mix</h2>
      <div className="h-72">
        {loading ? (
          <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={typeData}
                dataKey="minutes"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
              >
                <Cell fill="#0ea5e9" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
              </Pie>
                <Tooltip
                  formatter={(value) => [`${value} min`, 'Total']}
                  contentStyle={{
                    backgroundColor: isDark ? '#0f172a' : '#ffffff', // slate-900 vs white
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  labelStyle={{
                    color: isDark ? '#e2e8f0' : '#0f172a', // slate-200 vs slate-900
                    fontWeight: 500,
                  }}
                  itemStyle={{
                    color: isDark ? '#cbd5f5' : '#334155', // softer text
                  }}
                />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default SessionTypeMixCard
