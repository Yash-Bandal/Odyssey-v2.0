function SettingsPage({ theme, onThemeChange }) {
  const isDark = theme === 'dark'
  const settingsCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
  const settingsTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const settingsMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="space-y-6">
      <section className={settingsCardClass}>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Settings</div>
        <h1 className={['mt-2 text-2xl font-semibold', settingsTitleClass].join(' ')}>Appearance</h1>
        <p className={['mt-2 text-sm', settingsMutedClass].join(' ')}>
          
        </p>
      </section>

      <section className={settingsCardClass}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className={['text-base font-semibold', settingsTitleClass].join(' ')}>Theme</h2>
            <p className={['text-sm mt-1', settingsMutedClass].join(' ')}>
              Switch between light and dark interface.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
            className={[
              'relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300',
              isDark ? 'bg-slate-800' : 'bg-slate-300',
            ].join(' ')}
            title="Toggle theme"
          >
            <span
              className={[
                'inline-block h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-300',
                isDark ? 'translate-x-9' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
        </div>

        <div className={['mt-4 rounded-2xl border px-4 py-3 text-sm', isDark ? 'border-slate-700 bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 text-slate-600'].join(' ')}>
          Current theme: <span className={['font-semibold', settingsTitleClass].join(' ')}>{isDark ? 'Dark' : 'Light'}</span>
        </div>
      </section>
    </div>
  )
}


export default SettingsPage
