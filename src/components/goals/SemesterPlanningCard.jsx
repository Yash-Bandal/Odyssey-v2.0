import { CalendarDays, Clock, BarChart3 } from 'lucide-react'

function SemesterPlanningCard({
  cardClass,
  labelClass,
  inputClass,
  form,
  handleChange,
  calculations,
  metricCardClass,
  metricMutedClass,
  metricTitleClass,
  handleSave,
  saving,
  saveButtonClass,
}) {
  return (
    <section className={cardClass}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Semester Start</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Semester End</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <label className={labelClass}>Total Goal Hours</label>
          <input
            type="number"
            value={form.totalHours}
            onChange={(e) => handleChange('totalHours', e.target.value)}
            className={inputClass}
            placeholder="e.g. 300"
          />
        </div>
      </div>

      {calculations && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={metricCardClass}>
            <CalendarDays className="h-8 w-8 text-sky-500" />
            <div>
              <div className={metricMutedClass}>Total Study Days</div>
              <div className={metricTitleClass}>{calculations.totalDays}</div>
            </div>
          </div>

          <div className={metricCardClass}>
            <Clock className="h-8 w-8 text-emerald-500" />
            <div>
              <div className={metricMutedClass}>Daily Required</div>
              <div className={metricTitleClass}>{calculations.dailyAverage.toFixed(2)} h</div>
            </div>
          </div>

          <div className={metricCardClass}>
            <BarChart3 className="h-8 w-8 text-indigo-500" />
            <div>
              <div className={metricMutedClass}>Weekly Required</div>
              <div className={metricTitleClass}>{calculations.weeklyPace.toFixed(1)} h</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving} className={saveButtonClass}>
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </section>
  )
}

export default SemesterPlanningCard
