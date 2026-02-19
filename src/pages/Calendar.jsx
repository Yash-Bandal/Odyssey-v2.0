import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { toLocalDateKey } from '../utils/date'

function CalendarPage({ user, semester, sessionsVersion, isDark = false }) {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDateKey, setSelectedDateKey] = useState(() => toLocalDateKey(new Date()))

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('sessions')
        .select('id, name, type, start_time, end_time, duration_minutes')
        .eq('user_id', user.id)
        .eq('semester_id', semester.id)
        .order('start_time', { ascending: true })
        .limit(10000)

      if (error || !data) {
        setSessions([])
        setLoading(false)
        return
      }

      setSessions(data)
      setLoading(false)
    }

    load()
  }, [user.id, semester.id, sessionsVersion])

  const perDay = useMemo(() => {
    const map = new Map()
    sessions.forEach((session) => {
      const key = toLocalDateKey(session.start_time)
      const minutes = Number(session.duration_minutes) || 0
      if (!map.has(key)) {
        map.set(key, { minutes: 0, count: 0, sessions: [] })
      }
      const row = map.get(key)
      row.minutes += minutes
      row.count += 1
      row.sessions.push(session)
    })
    return map
  }, [sessions])

  const monthGrid = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    const start = new Date(year, month, 1)
    const end = new Date(year, month + 1, 0)
    const firstGrid = new Date(start)
    firstGrid.setDate(start.getDate() - start.getDay())
    const totalCells = 42

    const cells = []
    for (let i = 0; i < totalCells; i += 1) {
      const date = new Date(firstGrid)
      date.setDate(firstGrid.getDate() + i)
      const key = toLocalDateKey(date)
      const dayData = perDay.get(key) || { minutes: 0, count: 0, sessions: [] }
      cells.push({
        date,
        key,
        inMonth: date >= start && date <= end,
        minutes: dayData.minutes,
        count: dayData.count,
      })
    }
    return cells
  }, [viewDate, perDay])

  const selectedDayData = perDay.get(selectedDateKey) || { minutes: 0, count: 0, sessions: [] }

  const monthLabel = viewDate.toLocaleDateString([], { month: 'long', year: 'numeric' })
  const calendarCardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
  const calendarTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
  const calendarMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const calendarButtonClass = isDark
    ? 'rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800'
    : 'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'

  return (
    <div className="space-y-6">
      <section className={calendarCardClass}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Calendar</div>
            <h1 className={['mt-1 text-2xl font-semibold', calendarTitleClass].join(' ')}>{monthLabel}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
              className={calendarButtonClass}
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setViewDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
              className={calendarButtonClass}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
              className={calendarButtonClass}
            >
              Next
            </button>
          </div>
        </div>

        {loading ? (
          <div className={['h-56 flex items-center justify-center text-sm', calendarMutedClass].join(' ')}>Loading calendar...</div>
        ) : (
          <>
            <div className={['grid grid-cols-7 gap-2 mb-2 text-[11px] font-medium', calendarMutedClass].join(' ')}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="px-2 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {monthGrid.map((cell) => {
                const selected = selectedDateKey === cell.key
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() => setSelectedDateKey(cell.key)}
                    className={[
                      'min-h-[88px] rounded-2xl border p-2 text-left transition-colors',
                      cell.inMonth
                        ? isDark
                          ? 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                        : isDark
                          ? 'bg-slate-950 border-slate-800 text-slate-500'
                          : 'bg-slate-50 border-slate-100 text-slate-400',
                      selected ? 'ring-2 ring-sky-300 border-sky-300' : '',
                    ].join(' ')}
                  >
                    <div className="text-xs font-semibold">{cell.date.getDate()}</div>
                    <div className={['mt-2 text-[11px]', calendarMutedClass].join(' ')}>
                      {cell.minutes > 0 ? `${Math.round(cell.minutes)} min` : '0 min'}
                    </div>
                    <div className={['text-[11px]', isDark ? 'text-slate-500' : 'text-slate-400'].join(' ')}>
                      {cell.count > 0 ? `${cell.count} sessions` : 'No sessions'}
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className={calendarCardClass}>
        <h2 className={['text-lg font-semibold', calendarTitleClass].join(' ')}>
          {new Date(`${selectedDateKey}T00:00:00`).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </h2>
        <div className={['mt-1 text-sm', calendarMutedClass].join(' ')}>
          {Math.round(selectedDayData.minutes)} minutes total Â· {selectedDayData.count} sessions
        </div>

        <div className="mt-4 space-y-2">
          {selectedDayData.sessions.length === 0 ? (
            <div className={['rounded-xl border px-4 py-3 text-sm', isDark ? 'border-slate-700 bg-slate-800 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'].join(' ')}>
              No study sessions logged for this day.
            </div>
          ) : (
            selectedDayData.sessions.map((session) => {
              const start = new Date(session.start_time)
              return (
                <div key={session.id} className={['rounded-xl border px-4 py-3 flex items-center justify-between gap-3', isDark ? 'border-slate-700 bg-slate-800/80' : 'border-slate-200 bg-slate-50'].join(' ')}>
                  <div>
                    <div className={['text-sm font-semibold', calendarTitleClass].join(' ')}>{session.name || 'Focus session'}</div>
                    <div className={['text-xs', calendarMutedClass].join(' ')}>
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Â· {session.type}
                    </div>
                  </div>
                  <div className={['text-sm font-semibold', isDark ? 'text-slate-200' : 'text-slate-700'].join(' ')}>{Number(session.duration_minutes || 0).toFixed(1)} min</div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}


export default CalendarPage
