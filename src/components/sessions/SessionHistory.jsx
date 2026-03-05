import { Trash2 } from 'lucide-react'
import { playDelete } from '../../utils/sound'

function SessionHistory({
  isDark,
  sessionsCardClass,
  sessionsTitleTextClass,
  sessionsMutedTextClass,
  sessionsInputClass,
  filters,
  setFilters,
  subjects,
  loading,
  filteredSessions,
  visibleCount,
  setVisibleCount,
  INITIAL_VISIBLE,
  LOAD_MORE_COUNT,
  resolveSubjectName,
  handleDeleteSession,
  deleteButtonClass,
}) {
  return (
    <div className={['shadow-sm p-6 flex flex-col gap-6 ', sessionsCardClass].join(' ')}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className={['text-lg font-semibold', sessionsTitleTextClass].join(' ')}>
            Session history
          </h2>
          <div className={['text-sm', sessionsMutedTextClass].join(' ')}>
            Track and manage all recorded focus sessions
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <select
            value={filters.subjectId}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, subjectId: event.target.value }))
            }
            className={['rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
          >
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, fromDate: event.target.value }))
            }
            className={['rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, toDate: event.target.value }))
            }
            className={['rounded-2xl border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
          />

          <input
            type="number"
            min="0"
            value={filters.minMinutes}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, minMinutes: event.target.value }))
            }
            placeholder="Min min"
            className={['w-28 rounded-2xl border px-4 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
          />
        </div>
      </div>

      <div className={['overflow-hidden rounded-3xl border', isDark ? 'border-slate-800' : 'border-slate-100'].join(' ')}>
        {loading ? (
          <div className={['py-10 text-center text-sm', sessionsMutedTextClass].join(' ')}>
            Loading sessions...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center">
            <div className={['text-sm font-medium', isDark ? 'text-slate-200' : 'text-slate-700'].join(' ')}>
              No sessions yet
            </div>
            <div className={['text-sm mt-1', sessionsMutedTextClass].join(' ')}>
              Start a timer or log a manual session to see data here.
            </div>
          </div>
        ) : (
          <div className={['divide-y', isDark ? 'divide-slate-800' : 'divide-slate-100'].join(' ')}>
            {filteredSessions.slice(0, visibleCount).map((session) => {
              const date = new Date(session.start_time)
              const durationMinutes = Number(session.duration_minutes) || 0

              return (
                <div
                  key={session.id}
                  className={['flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 transition', isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'].join(' ')}
                >
                  <div className="flex flex-col gap-1">
                    <div className={['text-sm font-medium', sessionsTitleTextClass].join(' ')}>
                      {session.name || 'Focus session'}
                    </div>

                    <div className={['text-sm', sessionsMutedTextClass].join(' ')}>
                      {date.toLocaleDateString()} Ã‚Â·{' '}
                      {date.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs', isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'].join(' ')}>
                        {session.subject_id ? resolveSubjectName(session.subject_id) : 'Unassigned'}
                      </span>

                      <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs capitalize', isDark ? 'bg-sky-900/30 text-sky-300' : 'bg-sky-100 text-sky-700'].join(' ')}>
                        {session.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className={['text-lg font-semibold tabular-nums', sessionsTitleTextClass].join(' ')}>
                      {durationMinutes.toFixed(1)} min
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playDelete()
                        handleDeleteSession(session.id)
                      }}
                      className={deleteButtonClass}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )
            })}

            {filteredSessions.length > INITIAL_VISIBLE && (
              <div className="flex justify-center py-4 px-4">
                {visibleCount < filteredSessions.length ? (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
                    className={[
                      'rounded-2xl px-5 py-2 text-sm font-medium transition',
                      isDark
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    Show more
                  </button>
                ) : (
                  <button
                    onClick={() => setVisibleCount(INITIAL_VISIBLE)}
                    className={[
                      'rounded-2xl px-5 py-2 text-sm font-medium transition',
                      isDark
                        ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    Show less
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionHistory
