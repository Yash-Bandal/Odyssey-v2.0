function PomodoroSettingsPanel({
  timerMode,
  sessionsSubCardClass,
  sessionsTitleTextClass,
  sessionsMutedTextClass,
  sessionsInputClass,
  isDark,
  pomodoroPreset,
  setPomodoroPreset,
  customMinutes,
  setCustomMinutes,
}) {
  if (timerMode !== 'pomodoro') return null

  return (
    <div className="pt-8">
      <div className={['rounded-3xl border p-8 space-y-8 shadow-sm', sessionsSubCardClass].join(' ')}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={['text-lg font-semibold', sessionsTitleTextClass].join(' ')}>
              Pomodoro Settings
            </h3>
            <p className={['text-sm mt-1', sessionsMutedTextClass].join(' ')}>
              Configure your focus and break rhythm
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            <div>
              <div className={['text-xs font-semibold uppercase tracking-wider mb-3', sessionsMutedTextClass].join(' ')}>
                Focus Duration
              </div>

              <div className="flex flex-wrap gap-3">
                {['25', '60', '90', '180'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPomodoroPreset(value)}
                    className={[
                      'rounded-2xl px-4 py-2 text-sm font-semibold border transition-all duration-200',
                      pomodoroPreset === value
                        ? 'bg-sky-500 text-white border-sky-500  scale-[1.02]'
                        : isDark
                          ? 'bg-slate-900 text-slate-200 border-slate-900 hover:bg-slate-800'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                    ].join(' ')}
                  >
                    {value} min
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPomodoroPreset('custom')}
                  className={[
                    'rounded-2xl px-4 py-2 text-sm font-semibold border transition-all duration-200',
                    pomodoroPreset === 'custom'
                      ? 'bg-sky-500 text-white border-sky-500 shadow-md'
                      : isDark
                        ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                  ].join(' ')}
                >
                  Custom
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="300"
                    value={customMinutes}
                    onChange={(e) => {
                      setCustomMinutes(e.target.value)
                      setPomodoroPreset('custom')
                    }}
                    className={[
                      'w-24 rounded-2xl border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 transition',
                      sessionsInputClass,
                    ].join(' ')}
                  />
                  <span className={['text-sm', sessionsMutedTextClass].join(' ')}>
                    minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PomodoroSettingsPanel
