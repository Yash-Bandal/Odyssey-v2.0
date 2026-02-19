import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import AppShell from './components/layout/AppShell'
import AuthScreen from './components/auth/AuthScreen'
import SemesterSetupWizard from './components/auth/SemesterSetupWizard'



function AppRoot() {
  const [user, setUser] = useState(null)
  const [semester, setSemester] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [sessionsVersion, setSessionsVersion] = useState(0)

  useEffect(() => {
    let active = true

    const load = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!data.user?.email_confirmed_at) {
        setUser(null)
        setSemester(null)
        setInitializing(false)
        return
      }

      if (!active) return

      if (error || !data.user) {
        setUser(null)
        setSemester(null)
        setInitializing(false)
        return
      }

      setUser(data.user)

      const { data: latestSemester } = await supabase
        .from('semesters')
        .select('id, start_date, end_date, daily_required_hours, total_goal_hours')
        .eq('user_id', data.user.id)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      setSemester(latestSemester || null)
      setInitializing(false)
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const handleAuthenticated = async (nextUser) => {
    setUser(nextUser)
    setInitializing(true)

    const { data: latestSemester } = await supabase
      .from('semesters')
      .select('id, start_date, end_date, daily_required_hours, total_goal_hours')
      .eq('user_id', nextUser.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    setSemester(latestSemester || null)
    setInitializing(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSemester(null)
    setSessionsVersion(0)
  }

  const handleSessionsChanged = () => {
    setSessionsVersion((prev) => prev + 1)
  }

  const handleSemesterChanged = async () => {
    const { data: latestSemester } = await supabase
      .from('semesters')
      .select('id, start_date, end_date, total_goal_hours, total_study_days, daily_required_hours, weekly_required_hours')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()
    setSemester(latestSemester || null)
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">

        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.15),transparent_60%)]" />

        <div className="relative flex flex-col items-center gap-6">

          {/* Animated Ring */}
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border-2 border-slate-800" />
            <div className="absolute inset-0 rounded-full border-2 border-t-sky-400 border-r-emerald-400 animate-spin" />
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
            <h2 className="text-sm tracking-wide text-slate-300">
              Loading your Focus dashboard
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Push harder than yesterday <br />
              if you want a different tomorrow.
            </p>
          </div>

        </div>
      </div>

    )
  }

  if (!user) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  if (!semester) {
    return <SemesterSetupWizard user={user} onCompleted={(createdSemester) => setSemester(createdSemester)} />
  }

  return (
    <AppShell
      user={user}
      semester={semester}
      onSignOut={handleSignOut}
      sessionsVersion={sessionsVersion}
      onSessionsChanged={handleSessionsChanged}
      onSemesterChanged={handleSemesterChanged}
    />
  )
}


export default AppRoot
