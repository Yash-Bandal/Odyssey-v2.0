import { ChevronDown } from 'lucide-react'
import DatePicker from '../ui/DatePicker'
import { playDropDown, playPause } from '../../utils/sound'

function ManualSessionForm({
  isDark,
  sessionsTitleTextClass,
  sessionsMutedTextClass,
  sessionsInputClass,
  ClockImg,
  handleSaveManual,
  manualForm,
  handleManualChange,
  subjects,
  savingManual,
}) {
  return (
    <div className={['rounded-2xl shadow-sm p-5 space-y-6', isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'].join(' ')}>
      <div className="flex relative">
        <div>
          <h2 className={['text-base font-semibold', sessionsTitleTextClass].join(' ')}>
            Log manual session
          </h2>
          <p className={['text-xs mt-1', sessionsMutedTextClass].join(' ')}>
            Add study time completed outside the timer.
          </p>
        </div>

        <img
          src={ClockImg}
          alt="Study time"
          className={[
            'w-20 h-auto transition-opacity absolute mb-5  top-0 right-0 max-sm:top-10 max-sm:w-18 ',
            isDark ? 'opacity-60' : 'opacity-70',
          ].join(' ')}
        />
      </div>

      <form onSubmit={handleSaveManual} className="space-y-5">
        <div className="space-y-1.5">
          <label className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
            Session name
          </label>
          <input
            type="text"
            value={manualForm.name}
            onChange={(event) => handleManualChange('name', event.target.value)}
            className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
            placeholder="Deep work - Algorithms"
          />
        </div>

        <div className="space-y-1.5">
          <label className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
            Subject
          </label>

          <div className="relative">
            <select
              value={manualForm.subjectId}
              onChange={(event) => {
                playDropDown()
                handleManualChange('subjectId', event.target.value)
              }}
              className={[
                'w-full appearance-none rounded-xl border px-3 pr-10 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500',
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronDown size={16} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
            </div>
          </div>
        </div>

        <div className={['rounded-xl border p-4 space-y-5', isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'].join(' ')}>
          <div className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
            Time range
          </div>

          <div className="space-y-1.5">
            <label className={['text-[11px]', sessionsMutedTextClass].join(' ')}>Date</label>
            <DatePicker
              value={manualForm.startTime?.split('T')[0] || ''}
              isDark={isDark}
              onChange={(date) => {
                const startTime = manualForm.startTime?.split('T')[1] || '00:00'
                const endTime = manualForm.endTime?.split('T')[1] || '00:00'
                handleManualChange('startTime', `${date}T${startTime}`)
                handleManualChange('endTime', `${date}T${endTime}`)
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={['text-[11px]', sessionsMutedTextClass].join(' ')}>Start (HH:MM)</label>
              <input
                type="text"
                placeholder="14:30"
                value={manualForm.startTime?.split('T')[1] || '00:00'}
                onChange={(event) => {
                  const date = manualForm.startTime?.split('T')[0] || ''
                  handleManualChange('startTime', `${date}T${event.target.value}`)
                }}
                className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
              />
            </div>

            <div className="space-y-1.5">
              <label className={['text-[11px]', sessionsMutedTextClass].join(' ')}>End (HH:MM)</label>
              <input
                type="text"
                placeholder="16:00"
                value={manualForm.endTime?.split('T')[1] || '00:00'}
                onChange={(event) => {
                  const date = manualForm.endTime?.split('T')[0] || ''
                  handleManualChange('endTime', `${date}T${event.target.value}`)
                }}
                className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
              />
            </div>
          </div>

          {manualForm.startTime && manualForm.endTime && (
            <div className={['flex items-center justify-between rounded-xl border px-3 py-2 text-sm', isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'].join(' ')}>
              <span className={sessionsMutedTextClass}>Duration</span>
              <span className={['font-semibold', sessionsTitleTextClass].join(' ')}>
                {(() => {
                  const start = new Date(manualForm.startTime)
                  const end = new Date(manualForm.endTime)
                  const diff = (end - start) / 60000
                  if (diff > 0) {
                    const h = Math.floor(diff / 60)
                    const m = Math.floor(diff % 60)
                    return `${h}h ${m}m`
                  }
                  return '0h 0m'
                })()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
            Notes
          </label>
          <textarea
            rows={3}
            value={manualForm.notes}
            onChange={(event) => handleManualChange('notes', event.target.value)}
            className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
            placeholder="Optional notes..."
          />
        </div>

        <button
          type="submit"
          onClick={() => {
            playPause()
          }}
          disabled={savingManual}
          className={[
            'w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition',
            savingManual
              ? 'bg-slate-300 text-slate-500 cursor-wait'
              : 'bg-sky-500 text-white hover:bg-sky-600',
          ].join(' ')}
        >
          {savingManual ? 'Saving...' : 'Save manual session'}
        </button>
      </form>
    </div>
  )
}

export default ManualSessionForm
