import { ChevronDown } from 'lucide-react'
import { playClick, playPause } from '../../utils/sound'

function ActiveTimerPanel({
  isDark,
  sessionsCardClass,
  sessionsSubCardClass,
  sessionsSoftCardClass,
  sessionsInputClass,
  sessionsMutedTextClass,
  sessionsTitleTextClass,
  timerMode,
  handleModeSelect,
  activeTimer,
  handleCompleteTimer,
  formatTimer,
  mainTimerSeconds,
  handlePauseResume,
  handleStartSelected,
  handleCancelTimer,
  timerError,
  handleUpdateActive,
  subjects,
}) {
  return (
    <div className={['lg:col-span-2 px-5 py-5 sm:px-7 sm:py-6 flex flex-col gap-5', sessionsCardClass].join(' ')}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={['text-sm font-semibold tracking-tight', sessionsTitleTextClass].join(' ')}>
            Active timer
          </h2>
          <p className={['text-[11px] mt-1', sessionsMutedTextClass].join(' ')}>
            Track deep work blocks with Pomodoro or a simple stopwatch.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleModeSelect('pomodoro')}
            className={[
              'inline-flex items-center rounded-xl border px-3 py-2 text-[11px] font-medium transition',
              timerMode === 'pomodoro'
                ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
            ].join(' ')}
          >
            Pomodoro
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect('stopwatch')}
            className={[
              'inline-flex items-center rounded-xl border px-3 py-2 text-[11px] font-medium transition',
              timerMode === 'stopwatch'
                ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                : isDark
                  ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100',
            ].join(' ')}
          >
            Stopwatch
          </button>

          <button
            type="button"
            onClick={() => {
              playPause()
              handleCompleteTimer()
            }}
            disabled={!activeTimer}
            className={[
              'inline-flex items-center rounded-xl bg-green-500 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-green-600 shadow-sm transition',
              activeTimer
                ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                : 'bg-emerald-200 text-black  cursor-not-allowed',
            ].join(' ')}
          >
            Save session
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className={['px-8 py-10 shadow-sm flex flex-col items-center justify-center gap-4', sessionsSubCardClass].join(' ')}>
          <div className={['text-[11px] uppercase tracking-[0.18em]', sessionsMutedTextClass].join(' ')}>
            {timerMode === 'pomodoro' ? 'Pomodoro timer' : 'Stopwatch'}
          </div>

          <div className={['text-5xl sm:text-6xl font-semibold tracking-tight tabular-nums', sessionsTitleTextClass].join(' ')}>
            {formatTimer(mainTimerSeconds)}
          </div>

          <div className={['text-sm', sessionsMutedTextClass].join(' ')}>
            {activeTimer
              ? activeTimer.status === 'running'
                ? timerMode === 'pomodoro'
                  ? 'Counting down'
                  : 'Counting up'
                : 'Paused'
              : 'Ready'}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                playPause()
                handlePauseResume()
              }}
              disabled={!activeTimer}
              className={[
                'flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition',
                activeTimer
                  ? isDark
                    ? 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                  : isDark
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              ].join(' ')}
            >
              {activeTimer && activeTimer.status === 'running' ? 'Pause' : 'Resume'}
            </button>

            <button
              type="button"
              onClick={() => {
                playClick()
                handleStartSelected()
              }}
              className={[
                'flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition',
                isDark
                  ? 'bg-white text-slate-900 hover:bg-slate-200 active:scale-[0.98]'
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]',
              ].join(' ')}
            >
              Start
            </button>

            <button
              type="button"
              onClick={() => {
                playPause()
                handleCancelTimer()
              }}
              disabled={!activeTimer}
              className={[
                'flex-1 inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition',
                activeTimer
                  ? isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-red-900/20 hover:text-red-400'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600'
                  : isDark
                    ? 'border-slate-700 bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed',
              ].join(' ')}
            >
              Reset
            </button>
          </div>

          {timerError && (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 w-full max-w-md text-center">
              {timerError}
            </div>
          )}
        </div>

        {activeTimer && (
          <div className={['px-6 py-6 space-y-4', sessionsSoftCardClass].join(' ')}>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={activeTimer.name}
                onChange={(event) => handleUpdateActive('name', event.target.value)}
                className={['flex-1 rounded-2xl border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-sky-500', sessionsInputClass].join(' ')}
                placeholder="Session name"
              />

              <div className="relative">
                <select
                  value={activeTimer.subjectId}
                  onChange={(event) => handleUpdateActive('subjectId', event.target.value)}
                  className={[
                    'w-full appearance-none rounded-2xl border px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition',
                    isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-700',
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

            <textarea
              rows={3}
              value={activeTimer.notes}
              onChange={(event) => handleUpdateActive('notes', event.target.value)}
              className={['w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500', sessionsInputClass].join(' ')}
              placeholder="Optional notes about this focus block"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ActiveTimerPanel
