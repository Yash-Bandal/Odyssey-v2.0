import { useEffect, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import successSound from '../assets/session-success.mp3'
import ClockImg from '../assets/Clock.png';
import ActiveTimerPanel from '../components/sessions/ActiveTimerPanel'
import PomodoroSettingsPanel from '../components/sessions/PomodoroSettingsPanel'
import ManualSessionForm from '../components/sessions/ManualSessionForm'
import SessionHistory from '../components/sessions/SessionHistory'

function formatTimer(totalSeconds) {



  const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0
  const seconds = Math.floor(safe)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  //===================
  //button click sound

  // Delete button (trash icon)

  //====================

  if (hours > 0) {
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0'),
    ].join(':')
  }

  return [
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0'),
  ].join(':')
}

function SessionsPage({ user, semester, onSessionsChanged, isDark = false }) {

  //=========== Avoid Duplicate log========
  const hasCompletedRef = useRef(false)
  //====================================
  const [subjects, setSubjects] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') {
      return {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
      }
    }
    try {
      const raw = window.localStorage.getItem('odyssey:pomodoroSettings')
      if (!raw) {
        return {
          focusMinutes: 25,
          shortBreakMinutes: 5,
          longBreakMinutes: 15,
          longBreakInterval: 4,
        }
      }
      const parsed = JSON.parse(raw)
      return {
        focusMinutes: Number(parsed.focusMinutes) || 25,
        shortBreakMinutes: Number(parsed.shortBreakMinutes) || 5,
        longBreakMinutes: Number(parsed.longBreakMinutes) || 15,
        longBreakInterval: Number(parsed.longBreakInterval) || 4,
      }
    } catch {
      return {
        focusMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        longBreakInterval: 4,
      }
    }
  })
  const [activeTimer, setActiveTimer] = useState(() => {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem('odyssey:activeTimer')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  })
  const [timerNow, setTimerNow] = useState(() => Date.now())
  const [timerError, setTimerError] = useState('')
  const [timerMode, setTimerMode] = useState('pomodoro')
  const [pomodoroPreset, setPomodoroPreset] = useState('25')
  const [customMinutes, setCustomMinutes] = useState('25')
  const [manualForm, setManualForm] = useState({
    name: '',
    subjectId: '',
    startTime: '',
    endTime: '',
    durationMinutes: '',
    notes: '',
  })
  const [filters, setFilters] = useState({
    subjectId: '',
    fromDate: '',
    toDate: '',
    minMinutes: '',
  })
  const [savingManual, setSavingManual] = useState(false)


  //=========Sound ============
  const successAudioRef = useRef(null)

  useEffect(() => {
    successAudioRef.current = new Audio(successSound)
  }, [])

  //==========================

  //=======classes
  const deleteButtonClass = isDark ? 'text-red-400 hover:text-red-300 transition' : 'text-red-500 hover:text-red-600 transition';
  //=====================

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('odyssey:pomodoroSettings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [subjectsResult, sessionsResult] = await Promise.all([
        supabase
          .from('subjects')
          .select('id, name')
          .eq('semester_id', semester.id)
          .order('name'),
        supabase
          .from('sessions')
          .select(
            'id, name, type, subject_id, start_time, end_time, duration_minutes, notes',
          )
          .eq('user_id', user.id)
          .eq('semester_id', semester.id)
          .order('start_time', { ascending: false })
          .limit(100),
      ])

      if (!subjectsResult.error && subjectsResult.data) {
        setSubjects(subjectsResult.data)
      }

      if (!sessionsResult.error && sessionsResult.data) {
        setSessions(sessionsResult.data)
      }

      setLoading(false)
    }

    load()
  }, [semester.id, user.id])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!activeTimer) {
      window.localStorage.removeItem('odyssey:activeTimer')
      return
    }
    window.localStorage.setItem('odyssey:activeTimer', JSON.stringify(activeTimer))
  }, [activeTimer])

  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') return

    const id = window.setInterval(() => {
      setTimerNow(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(id)
    }
  }, [activeTimer])

  const resolveSubjectName = (subjectId) => {
    const match = subjects.find((subject) => subject.id === subjectId)
    return match ? match.name : 'Unassigned'
  }

  const derivedElapsedSeconds = () => {
    if (!activeTimer) return 0
    if (activeTimer.status !== 'running') return activeTimer.elapsedSeconds || 0
    const start = new Date(activeTimer.startedAt).getTime()
    if (!Number.isFinite(start)) return activeTimer.elapsedSeconds || 0
    const base = activeTimer.elapsedSeconds || 0
    const delta = (timerNow - start) / 1000
    if (!Number.isFinite(delta) || delta < 0) return base
    return base + delta
  }

  const handleModeSelect = (mode) => {
    setTimerError('')
    setTimerMode(mode)
  }

  const resolvePomodoroMinutes = () => {
    if (pomodoroPreset === 'custom') {
      const value = Number(customMinutes)
      if (!Number.isFinite(value) || value <= 0) {
        return 25
      }
      return value
    }
    const preset = Number(pomodoroPreset)
    if (!Number.isFinite(preset) || preset <= 0) {
      return 25
    }
    return preset
  }

  const handleStartSelected = () => {
    setTimerError('')
    if (!semester) {
      setTimerError('You need an active semester before starting a timer.')
      return
    }

    if (timerMode === 'pomodoro') {
      const minutes = resolvePomodoroMinutes()
      setActiveTimer({
        id: `${Date.now()}`,
        type: 'pomodoro',
        status: 'running',
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0,
        durationSeconds: minutes * 60,
        subjectId: '',
        name: '',
        notes: '',
      })
      return
    }

    setActiveTimer({
      id: `${Date.now()}`,
      type: 'stopwatch',
      status: 'running',
      startedAt: new Date().toISOString(),
      elapsedSeconds: 0,
      durationSeconds: 0,
      subjectId: '',
      name: '',
      notes: '',
    })
  }

  const handleUpdateActive = (field, value) => {
    if (!activeTimer) return
    setActiveTimer((prev) => ({ ...prev, [field]: value }))
  }

  const handlePauseResume = () => {
    if (!activeTimer) return
    if (activeTimer.status === 'running') {
      const updatedElapsed = derivedElapsedSeconds()
      setActiveTimer((prev) => ({
        ...prev,
        status: 'paused',
        elapsedSeconds: updatedElapsed,
        startedAt: new Date().toISOString(),
      }))
    } else {
      setActiveTimer((prev) => ({
        ...prev,
        status: 'running',
        startedAt: new Date().toISOString(),
      }))
    }
  }

  const handleCancelTimer = () => {
    setActiveTimer(null)
    setTimerError('')
  }

  const persistSession = async ({ name, type, subjectId, startedAt, endedAt, durationSeconds, notes }) => {
    const durationMinutes = durationSeconds / 60
    const payload = {
      user_id: user.id,
      semester_id: semester.id,
      subject_id: subjectId || null,
      name: name || 'Focus session',
      type,
      start_time: startedAt,
      end_time: endedAt,
      duration_minutes: durationMinutes,
      notes: notes || null,
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(payload)
      .select()
      .single()

    if (error) {
      setTimerError(error.message)
      return null
    }

    setSessions((prev) => [data, ...prev])

    //======= Sound////////////

    if (successAudioRef.current) {
      successAudioRef.current.currentTime = 0
      successAudioRef.current.play().catch(() => { })
    }

    //===================================


    if (onSessionsChanged) {
      onSessionsChanged()
    }
    return data
  }

  const handleCompleteTimer = async () => {
    if (!activeTimer) return
    setTimerError('')
    const elapsedSeconds = derivedElapsedSeconds()
    let durationSeconds

    if (activeTimer.type === 'pomodoro') {
      durationSeconds = activeTimer.durationSeconds || elapsedSeconds
    } else {
      durationSeconds = elapsedSeconds
    }

    if (!durationSeconds || durationSeconds <= 0) {
      setTimerError('Timer has no recorded duration.')
      return
    }

    const startedAt = activeTimer.startedAt
    const endedAt = new Date().toISOString()

    await persistSession({
      name: activeTimer.name,
      type: activeTimer.type,
      subjectId: activeTimer.subjectId,
      startedAt,
      endedAt,
      durationSeconds,
      notes: activeTimer.notes,
    })

    setActiveTimer(null)
  }

  const handleManualChange = (field, value) => {
    setManualForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveManual = async (event) => {
    event.preventDefault()
    setSavingManual(true)

    const startTime = manualForm.startTime
    const endTime = manualForm.endTime

    if (!startTime || !endTime) {
      setSavingManual(false)
      return
    }

    const startDate = new Date(startTime)
    const endDate = new Date(endTime)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
      setSavingManual(false)
      return
    }

    const diffSeconds = (endDate.getTime() - startDate.getTime()) / 1000

    await persistSession({
      name: manualForm.name,
      type: 'manual',
      subjectId: manualForm.subjectId ? Number(manualForm.subjectId) : null,
      startedAt: startDate.toISOString(),
      endedAt: endDate.toISOString(),
      durationSeconds: diffSeconds,
      notes: manualForm.notes,
    })

    setManualForm({
      name: '',
      subjectId: '',
      startTime: '',
      endTime: '',
      durationMinutes: '',
      notes: '',
    })
    setSavingManual(false)
  }

  const handleDeleteSession = async (sessionId) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
    if (error) {
      await new Promise((resolve) => setTimeout(resolve, 0))
      const { data: refreshed } = await supabase
        .from('sessions')
        .select(
          'id, name, type, subject_id, start_time, end_time, duration_minutes, notes',
        )
        .eq('user_id', user.id)
        .eq('semester_id', semester.id)
        .order('start_time', { ascending: false })
        .limit(100)
      if (refreshed) {
        setSessions(refreshed)
      }
      return
    }
    if (onSessionsChanged) {
      onSessionsChanged()
    }
  }

  const filteredSessions = sessions.filter((session) => {
    if (filters.subjectId && session.subject_id !== Number(filters.subjectId)) {
      return false
    }

    if (filters.minMinutes) {
      const min = Number(filters.minMinutes)
      if (Number.isFinite(min) && session.duration_minutes < min) {
        return false
      }
    }

    if (filters.fromDate) {
      const from = new Date(filters.fromDate)
      const sessionDate = new Date(session.start_time)
      if (sessionDate < from) return false
    }

    if (filters.toDate) {
      const to = new Date(filters.toDate)
      const sessionDate = new Date(session.start_time)
      if (sessionDate > to) return false
    }

    return true
  })

  const elapsed = derivedElapsedSeconds()
  const remaining =
    activeTimer && activeTimer.durationSeconds
      ? Math.max(activeTimer.durationSeconds - elapsed, 0)
      : null

  const mainTimerSeconds = (() => {
    if (activeTimer && activeTimer.type === 'pomodoro') {
      if (remaining !== null) {
        return remaining
      }
      return activeTimer.durationSeconds || 0
    }
    if (!activeTimer && timerMode === 'pomodoro') {
      const minutes = resolvePomodoroMinutes()
      return minutes * 60
    }
    return activeTimer ? elapsed : 0
  })()

  // useEffect(() => {
  //   if (!activeTimer) return
  //   if (activeTimer.type !== 'pomodoro') return
  //   if (activeTimer.status !== 'running') return
  //   if (remaining === null || remaining > 0) return

  //   const complete = async () => {
  //     await handleCompleteTimer()
  //   }

  //   complete()
  // }, [activeTimer, remaining, handleCompleteTimer])

  useEffect(() => {
    if (!activeTimer) {
      hasCompletedRef.current = false
      return
    }

    if (activeTimer.type !== 'pomodoro') return
    if (activeTimer.status !== 'running') return
    if (remaining === null || remaining > 0) return

    // ?? Prevent duplicate completion
    if (hasCompletedRef.current) return

    hasCompletedRef.current = true

    const complete = async () => {
      await handleCompleteTimer()
    }

    complete()
  }, [activeTimer, remaining])

  const sessionsCardClass = isDark
    ? 'rounded-3xl bg-slate-900 text-slate-100 shadow-sm border border-slate-800'
    : 'rounded-3xl bg-white text-slate-900 shadow-sm border border-slate-200'
  const sessionsSubCardClass = isDark
    ? 'rounded-3xl bg-slate-950 border border-slate-800'
    : 'rounded-3xl bg-white border border-slate-200'
  const sessionsSoftCardClass = isDark
    ? 'rounded-3xl bg-slate-800/70 border border-slate-700'
    : 'rounded-3xl bg-slate-50 border border-slate-200'
  const sessionsInputClass = isDark
    ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500'
    : 'border-slate-200 bg-white text-slate-700 placeholder:text-slate-400'
  const sessionsMutedTextClass = isDark ? 'text-slate-400' : 'text-slate-500'
  const sessionsTitleTextClass = isDark ? 'text-slate-100' : 'text-slate-900'




  //====================Load sessions========
  const INITIAL_VISIBLE = 4
  const LOAD_MORE_COUNT = 10

  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE)
  }, [filters, filteredSessions.length])
  //================================



  //======================== Title Timer (Only render on sessionpage not other) ===================
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Default title
    const baseTitle = "Odyssey - Deep Work";

    if (!activeTimer) {
      document.title = baseTitle;
      return;
    }

    const seconds = mainTimerSeconds;
    const formatted = formatTimer(seconds);

    if (activeTimer.status === "paused") {
      // document.title = `? ${formatted} – ${baseTitle}`;
      document.title = `Paused ${formatted} `;
      return;
    }

    if (activeTimer.type === "pomodoro") {
      document.title = `${formatted} – Focus `;
    } else {
      document.title = `${formatted} – Stopwatch `;
    }
  }, [activeTimer, mainTimerSeconds]);

  // useEffect(() => {
  //   if (typeof document === "undefined") return;

  //   const baseTitle = "Odyssey - Deep Work";
  //   let timeoutId;

  //   const tick = () => {
  //     if (!activeTimer) {
  //       document.title = baseTitle;
  //       return;
  //     }

  //     let seconds = 0;

  //     const start = new Date(activeTimer.startedAt).getTime();
  //     const baseElapsed = activeTimer.elapsedSeconds || 0;

  //     if (activeTimer.status === "running") {
  //       seconds = baseElapsed + (Date.now() - start) / 1000;
  //     } else {
  //       seconds = baseElapsed;
  //     }

  //     if (activeTimer.type === "pomodoro") {
  //       seconds = Math.max(
  //         (activeTimer.durationSeconds || 0) - seconds,
  //         0
  //       );
  //     }

  //     const formatted = formatTimer(seconds);

  //     if (activeTimer.status === "paused") {
  //       document.title = `? ${formatted} – ${baseTitle}`;
  //     } else if (activeTimer.type === "pomodoro") {
  //       document.title = `${formatted} – Focus – ${baseTitle}`;
  //     } else {
  //       document.title = `${formatted} – Stopwatch – ${baseTitle}`;
  //     }

  //     // ?? self-adjusting scheduling
  //     const delay = 1000 - (Date.now() % 1000);
  //     timeoutId = setTimeout(tick, delay);
  //   };

  //   tick();

  //   return () => clearTimeout(timeoutId);
  // }, [activeTimer]);
  //==================================================

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2">
          <ActiveTimerPanel
            isDark={isDark}
            sessionsCardClass={sessionsCardClass}
            sessionsSubCardClass={sessionsSubCardClass}
            sessionsSoftCardClass={sessionsSoftCardClass}
            sessionsInputClass={sessionsInputClass}
            sessionsMutedTextClass={sessionsMutedTextClass}
            sessionsTitleTextClass={sessionsTitleTextClass}
            timerMode={timerMode}
            handleModeSelect={handleModeSelect}
            activeTimer={activeTimer}
            handleCompleteTimer={handleCompleteTimer}
            formatTimer={formatTimer}
            mainTimerSeconds={mainTimerSeconds}
            handlePauseResume={handlePauseResume}
            handleStartSelected={handleStartSelected}
            handleCancelTimer={handleCancelTimer}
            timerError={timerError}
            handleUpdateActive={handleUpdateActive}
            subjects={subjects}
          />

          <PomodoroSettingsPanel
            timerMode={timerMode}
            sessionsSubCardClass={sessionsSubCardClass}
            sessionsTitleTextClass={sessionsTitleTextClass}
            sessionsMutedTextClass={sessionsMutedTextClass}
            sessionsInputClass={sessionsInputClass}
            isDark={isDark}
            pomodoroPreset={pomodoroPreset}
            setPomodoroPreset={setPomodoroPreset}
            customMinutes={customMinutes}
            setCustomMinutes={setCustomMinutes}
          />
        </div>

        <ManualSessionForm
          isDark={isDark}
          sessionsTitleTextClass={sessionsTitleTextClass}
          sessionsMutedTextClass={sessionsMutedTextClass}
          sessionsInputClass={sessionsInputClass}
          ClockImg={ClockImg}
          handleSaveManual={handleSaveManual}
          manualForm={manualForm}
          handleManualChange={handleManualChange}
          subjects={subjects}
          savingManual={savingManual}
        />
      </div>

      <SessionHistory
        isDark={isDark}
        sessionsCardClass={sessionsCardClass}
        sessionsTitleTextClass={sessionsTitleTextClass}
        sessionsMutedTextClass={sessionsMutedTextClass}
        sessionsInputClass={sessionsInputClass}
        filters={filters}
        setFilters={setFilters}
        subjects={subjects}
        loading={loading}
        filteredSessions={filteredSessions}
        visibleCount={visibleCount}
        setVisibleCount={setVisibleCount}
        INITIAL_VISIBLE={INITIAL_VISIBLE}
        LOAD_MORE_COUNT={LOAD_MORE_COUNT}
        resolveSubjectName={resolveSubjectName}
        handleDeleteSession={handleDeleteSession}
        deleteButtonClass={deleteButtonClass}
      />
    </div>
  )
}


export default SessionsPage


