import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

function CumulativeHoursCard({
  loading,
  cumulativeData,
  analyticsCardClass,
  analyticsTitleClass,
  analyticsMutedClass,
  analyticsGridStroke,
  analyticsTick,
}) {
  return (
    <section className={analyticsCardClass}>
      <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>30-Day Cumulative Hours</h2>
      <div className="h-72">
        {loading ? (
          <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
              <XAxis dataKey="day" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip formatter={(value) => [`${value} h`, 'Cumulative']} />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default CumulativeHoursCard
