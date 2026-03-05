import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'

function YearlyStudyHoursCard({
  loading,
  monthlyData,
  analyticsCardClass,
  analyticsTitleClass,
  analyticsMutedClass,
  analyticsGridStroke,
  analyticsTick,
}) {
  return (
    <section className={analyticsCardClass}>
      <h2 className={['text-lg font-semibold mb-4', analyticsTitleClass].join(' ')}>Yearly Study Hours (Jan-Dec)</h2>
      <div className="h-72">
        {loading ? (
          <div className={['h-full flex items-center justify-center text-sm', analyticsMutedClass].join(' ')}>Loading analytics...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={analyticsGridStroke} />
              <XAxis dataKey="month" tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: analyticsTick, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip formatter={(value) => [`${value} h`, 'Total']} />
              <Bar dataKey="hours" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default YearlyStudyHoursCard
