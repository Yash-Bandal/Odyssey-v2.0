import { useEffect, useMemo, useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { StatCard, SectionCard } from './AppPages'
import successSound from '../assets/session-success.mp3'
import ClockImg from '../assets/Clock.png';

import { playClick, playPause, playDropDown } from "../utils/sound"
import {
    Trash2,
} from "lucide-react";

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

  useEffect(() => {
    if (!activeTimer) return
    if (activeTimer.type !== 'pomodoro') return
    if (activeTimer.status !== 'running') return
    if (remaining === null || remaining > 0) return

    const complete = async () => {
      await handleCompleteTimer()
    }

    complete()
  }, [activeTimer, remaining, handleCompleteTimer])

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


  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
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
{/* 
              <button
                type="button"
                onClick={handleStartSelected}
                className="inline-flex items-center rounded-xl bg-green-500 text-white px-3 py-1.5 text-[11px] font-semibold hover:bg-green-600 shadow-sm transition"
              >
                Start
              </button> */}

              <button
                type="button"
                // onClick={handleCompleteTimer}
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

            {/* TIMER SURFACE â€” FULL WIDTH */}
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
                  // onClick={handlePauseResume}
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

                {/* <button
                  type="button"
                  onClick={handleCompleteTimer}
                  disabled={!activeTimer}
                  className={[
                    'flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition',
                    activeTimer
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                      : 'bg-emerald-200 text-white cursor-not-allowed',
                  ].join(' ')}
                >
                  Save session
                </button> */}

                <button
                  type="button"
                  // onClick={handleStartSelected}
                  onClick={() => {
                    playClick()
                    handleStartSelected()
                  }}
                  className={[
                    "flex-1 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition",
                    isDark
                      ? "bg-white text-slate-900 hover:bg-slate-200 active:scale-[0.98]"
                      : "bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98]"
                  ].join(" ")}
                >
                  Start
                </button>

                <button
                  type="button"
                  // onClick={handleCancelTimer}
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
                  {/* Stop in Between */}
                  Reset
                </button>
              </div>

              {timerError && (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 w-full max-w-md text-center">
                  {timerError}
                </div>
              )}
            </div>

            {/* ACTIVE SESSION META â€” COMPACT + CLEAN */}
            {activeTimer && (
              <div className={['px-6 py-6 space-y-4', sessionsSoftCardClass].join(' ')}>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={activeTimer.name}
                    onChange={(event) =>
                      handleUpdateActive('name', event.target.value)
                    }
                    className={['flex-1 rounded-2xl border px-4 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-sky-500', sessionsInputClass].join(' ')}
                    placeholder="Session name"
                  />

                  <select
                    value={activeTimer.subjectId}
                    onChange={(event) =>
                      handleUpdateActive('subjectId', event.target.value)

                    }
                    className={['rounded-2xl border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500', sessionsInputClass].join(' ')}
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows={3}
                  value={activeTimer.notes}
                  onChange={(event) =>
                    handleUpdateActive('notes', event.target.value)
                  }
                  className={['w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500', sessionsInputClass].join(' ')}
                  placeholder="Optional notes about this focus block"
                />
              </div>
            )}
          </div>


          {timerMode === 'pomodoro' && (
            <div className="pt-6">

              <div className={['shadow-sm p-6 space-y-6', sessionsSubCardClass].join(' ')}>

                {/* SECTION TITLE */}
                <div className={['text-sm font-semibold', sessionsTitleTextClass].join(' ')}>
                  Pomodoro Settings
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                  {/* Pomodoro Length */}
                  <div className="space-y-3">
                    <div className={['text-xs font-medium uppercase tracking-wide', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                      Pomodoro length
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {['25', '45', '90', '180'].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setPomodoroPreset(value)}
                          className={[
                            'rounded-2xl px-3 py-1.5 text-sm font-medium border transition',
                            pomodoroPreset === value
                              ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                              : isDark
                                ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                          ].join(' ')}
                        >
                          {value}m
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setPomodoroPreset('custom')}
                        className={[
                          'rounded-2xl px-3 py-1.5 text-sm font-medium border transition',
                          pomodoroPreset === 'custom'
                            ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                            : isDark
                              ? 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100',
                        ].join(' ')}
                      >
                        Custom
                      </button>

                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={customMinutes}
                        onChange={(event) => {
                          setCustomMinutes(event.target.value)
                          setPomodoroPreset('custom')
                        }}
                        className={['w-20 rounded-2xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                      />
                      <span className={['text-sm', sessionsMutedTextClass].join(' ')}>min</span>
                    </div>
                  </div>

                  {/* Short Break */}
                  <div className="space-y-3">
                    <div className={['text-xs font-medium uppercase tracking-wide', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                      Short break
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.shortBreakMinutes}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            shortBreakMinutes: Number(event.target.value) || 5,
                          }))
                        }
                        className={['w-20 rounded-2xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                      />
                      <span className={['text-sm', sessionsMutedTextClass].join(' ')}>min</span>
                    </div>
                  </div>

                  {/* Long Break */}
                  <div className="space-y-3">
                    <div className={['text-xs font-medium uppercase tracking-wide', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                      Long break
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="90"
                        value={settings.longBreakMinutes}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            longBreakMinutes: Number(event.target.value) || 15,
                          }))
                        }
                        className={['w-20 rounded-2xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                      />
                      <span className={['text-sm', sessionsMutedTextClass].join(' ')}>min</span>
                    </div>
                  </div>

                  {/* Long Break Interval */}
                  <div className="space-y-3">
                    <div className={['text-xs font-medium uppercase tracking-wide', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                      Long break every
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="2"
                        max="12"
                        value={settings.longBreakInterval}
                        onChange={(event) =>
                          setSettings((prev) => ({
                            ...prev,
                            longBreakInterval: Number(event.target.value) || 4,
                          }))
                        }
                        className={['w-20 rounded-2xl border px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                      />
                      <span className={['text-sm', sessionsMutedTextClass].join(' ')}>cycles</span>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </div>


        <div className={['rounded-2xl shadow-sm p-5 space-y-6', isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'].join(' ')}>

          {/* Header */}
          <div className='flex relative'>
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
                "w-20 h-auto transition-opacity absolute mb-5  top-0 right-0 max-sm:top-10 max-sm:w-18 ",
                isDark ? "opacity-60" : "opacity-70"
              ].join(" ")}
            />
          </div>


          <form onSubmit={handleSaveManual}
           className="space-y-5">

            {/* Session Name */}
            <div className="space-y-1.5">
              <label className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                Session name
              </label>
              <input
                type="text"
                value={manualForm.name}
                onChange={(event) => handleManualChange('name', event.target.value)}
                className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                placeholder="Deep work â€“ Algorithms"
              />
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                Subject
              </label>
              <select
                value={manualForm.subjectId}
                onChange={(event) => {
                  playDropDown()
                  handleManualChange('subjectId', event.target.value)


                }}
                className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
              >
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Section */}
            <div className={['rounded-xl border p-4 space-y-5', isDark ? 'bg-slate-800/70 border-slate-700' : 'bg-slate-50 border-slate-200'].join(' ')}>

              <div className={['text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>
                Time range
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className={['text-[11px]', sessionsMutedTextClass].join(' ')}>Date</label>
                <input
                  type="date"
                  value={manualForm.startTime?.split('T')[0] || ''}
                  onChange={(event) => {
                    const date = event.target.value
                    const startTime = manualForm.startTime?.split('T')[1] || '00:00'
                    const endTime = manualForm.endTime?.split('T')[1] || '00:00'

                    handleManualChange('startTime', `${date}T${startTime}`)
                    handleManualChange('endTime', `${date}T${endTime}`)
                  }}
                  className={['w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500', sessionsInputClass].join(' ')}
                />
              </div>

              {/* Start & End typed time */}
              <div className="grid grid-cols-2 gap-4">

                {/* Start */}
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

                {/* End */}
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

              {/* Duration Preview */}
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
                      return 'â€”'
                    })()}
                  </span>
                </div>
              )}

            </div>


            {/* Notes */}
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

            {/* Submit */}
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
                  : 'bg-sky-500 text-white hover:bg-sky-600'
              ].join(' ')}
            >
              {savingManual ? 'Saving...' : 'Save manual session'}
            </button>

          </form>
        </div>

      </div>

      <div className={['shadow-sm p-6 flex flex-col gap-6', sessionsCardClass].join(' ')}>

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className={['text-lg font-semibold', sessionsTitleTextClass].join(' ')}>
              Session history
            </h2>
            <div className={['text-sm', sessionsMutedTextClass].join(' ')}>
              Track and manage all recorded focus sessions
            </div>
          </div>

          {/* FILTERS */}
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

        {/* CONTENT */}
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

              {filteredSessions.map((session) => {
                const date = new Date(session.start_time)
                const durationMinutes = Number(session.duration_minutes) || 0

                return (
                  <div
                    key={session.id}
                    className={['flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 transition', isDark ? 'hover:bg-slate-800/60' : 'hover:bg-slate-50'].join(' ')}
                  >

                    {/* LEFT SIDE */}
                    <div className="flex flex-col gap-1">

                      <div className={['text-sm font-medium', sessionsTitleTextClass].join(' ')}>
                        {session.name || 'Focus session'}
                      </div>

                      <div className={['text-sm', sessionsMutedTextClass].join(' ')}>
                        {date.toLocaleDateString()} Â·{' '}
                        {date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">

                        <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs', isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'].join(' ')}>
                          {session.subject_id
                            ? resolveSubjectName(session.subject_id)
                            : 'Unassigned'}
                        </span>

                        <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs capitalize', isDark ? 'bg-sky-900/30 text-sky-300' : 'bg-sky-100 text-sky-700'].join(' ')}>
                          {session.type}
                        </span>

                      </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-4">

                      <div className={['text-lg font-semibold tabular-nums', sessionsTitleTextClass].join(' ')}>
                        {durationMinutes.toFixed(1)} min
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          playPause()
                          handleDeleteSession(session.id)
                        
                        }}
                        // className={['rounded-xl px-3 py-1.5 text-sm font-medium transition hover:text-red-500', isDark ? 'text-slate-400 hover:bg-red-900/20' : 'text-slate-500 hover:bg-red-50'].join(' ')}
                        className={deleteButtonClass}
                      >
                        {/* Delete */}
                        <Trash2 className="h-5 w-5" />
                      </button>

                    </div>
                  </div>
                )
              })}

            </div>
          )}
        </div>
      </div>

    </div>

  )
}


export default SessionsPage
