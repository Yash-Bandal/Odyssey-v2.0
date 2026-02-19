import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useSemesterCalculations } from '../../hooks/useSemesterCalculations'

function SemesterSetupWizard({ user, onCompleted }) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    totalHours: '',
    subjects: [{ name: '', targetHours: '', weight: '' }],
  })

  const totals = useSemesterCalculations({
    startDate: form.startDate,
    endDate: form.endDate,
    totalHours: form.totalHours,
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubjectChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.subjects]
      next[index] = { ...next[index], [field]: value }
      return { ...prev, subjects: next }
    })
  }

  const addSubjectRow = () => {
    setForm((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: '', targetHours: '', weight: '' }],
    }))
  }

  const removeSubjectRow = (index) => {
    setForm((prev) => {
      const next = prev.subjects.filter((_, i) => i !== index)
      return { ...prev, subjects: next.length ? next : [{ name: '', targetHours: '', weight: '' }] }
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const calculations = totals
    if (!calculations) {
      setError('Please provide a valid date range and total hours.')
      return
    }

    const validSubjects = form.subjects
      .map((subject) => ({
        ...subject,
        name: subject.name.trim(),
      }))
      .filter((subject) => subject.name && Number(subject.targetHours) > 0)

    if (!validSubjects.length) {
      setError('Add at least one subject with a name and target hours.')
      return
    }

    setSubmitting(true)
    try {
      if (!user) {
        setError('You need to be signed in before saving your semester.')
        setSubmitting(false)
        return
      }

      const { data: semester, error: semesterError } = await supabase
        .from('semesters')
        .insert({
          user_id: user.id,
          start_date: form.startDate,
          end_date: form.endDate,
          total_goal_hours: Number(form.totalHours),
          total_study_days: calculations.totalDays,
          daily_required_hours: calculations.dailyAverage,
          weekly_required_hours: calculations.weeklyPace,
        })
        .select()
        .single()

      if (semesterError) {
        setError(semesterError.message)
        setSubmitting(false)
        return
      }

      const subjectsPayload = validSubjects.map((subject) => ({
        semester_id: semester.id,
        name: subject.name,
        target_hours: Number(subject.targetHours),
        weight: subject.weight ? Number(subject.weight) : null,
      }))

      if (subjectsPayload.length) {
        const { error: subjectsError } = await supabase.from('subjects').insert(subjectsPayload)
        if (subjectsError) {
          setError(subjectsError.message)
          setSubmitting(false)
          return
        }
      }

      onCompleted(semester)
    } catch {
      setError('Unable to save semester. Check your Supabase setup and try again.')
      setSubmitting(false)
    }
  }

  const canContinueDates =
    Boolean(form.startDate) && Boolean(form.endDate) && Boolean(form.totalHours) && Boolean(totals)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-200 flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-sky-500 uppercase tracking-[0.2em]">
              Odyssey Setup
            </div>
            <h1 className="text-xl font-semibold text-slate-800">
              Configure your semester
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? 'bg-sky-500' : 'bg-slate-200'}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? 'bg-sky-500' : 'bg-slate-200'}`} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {/* Start Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">
                    Semester start
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">
                    Semester end
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                  />
                </div>

                {/* Total Goal */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">
                    Total study goal (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={form.totalHours}
                    onChange={(e) => handleChange('totalHours', e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
                    placeholder="e.g. 300"
                  />
                </div>
              </div>

              {/* Analytics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-5">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Total study days
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-800">
                    {totals ? totals.totalDays : '-'}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-5">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Daily required
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-800">
                    {totals ? `${totals.dailyAverage.toFixed(2)} h` : '-'}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-5 py-5">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">
                    Weekly pace
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-slate-800">
                    {totals ? `${totals.weeklyPace.toFixed(1)} h/week` : '-'}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!canContinueDates}
                  onClick={() => setStep(2)}
                  className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition ${canContinueDates
                      ? 'bg-sky-500 text-white hover:bg-sky-600'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                >
                  Next: Subjects
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Define subjects and their target hours.
                </div>
                <button
                  type="button"
                  onClick={addSubjectRow}
                  className="rounded-xl bg-slate-100 border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition"
                >
                  Add subject
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto">
                {form.subjects.map((subject, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 items-center"
                  >
                    <input
                      type="text"
                      value={subject.name}
                      onChange={(e) =>
                        handleSubjectChange(index, 'name', e.target.value)
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Subject name"
                    />
                    <input
                      type="number"
                      value={subject.targetHours}
                      onChange={(e) =>
                        handleSubjectChange(index, 'targetHours', e.target.value)
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Target h"
                    />
                    <input
                      type="number"
                      value={subject.weight}
                      onChange={(e) =>
                        handleSubjectChange(index, 'weight', e.target.value)
                      }
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-sky-500 transition"
                      placeholder="Weight %"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubjectRow(index)}
                      className="rounded-xl bg-red-50 text-red-600 border border-red-200 px-3 py-2 text-xs hover:bg-red-100 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition ${submitting
                      ? 'bg-slate-300 text-slate-500 cursor-wait'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                >
                  {submitting ? 'Saving...' : 'Save semester'}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="text-xs text-slate-500">
            Data is stored securely. You can modify semester details later from Dashboard.
          </div>
        </form>
      </div>
    </div>

  )
}


export default SemesterSetupWizard
