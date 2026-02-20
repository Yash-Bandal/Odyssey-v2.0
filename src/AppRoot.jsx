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

  // Theme state — defined once here at the root
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = window.localStorage.getItem('odyssey:theme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  const isDark = theme === 'dark'

  // Persist theme changes to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('odyssey:theme', theme)
  }, [theme])

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

  // Loading screen – now uses isDark from root-level theme
  if (initializing) {
    return (
      <div className={`min-h-screen flex items-center justify-center px-6 transition-colors duration-300
        ${isDark ? 'bg-slate-950' : 'bg-white'}`}
      >
        <div className="flex flex-col items-center gap-5">
          <p className={`text-xl sm:text-2xl font-light tracking-wider uppercase
            ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
          >
            Preparing your dashboard
          </p>

          <div className="flex gap-3">
            <span className={`w-3.5 h-3.5 rounded-full animate-slow-bounce
              ${isDark ? 'bg-slate-400/80' : 'bg-slate-500/80'}`}
              style={{ animationDelay: '0ms' }}
            />
            <span className={`w-3.5 h-3.5 rounded-full animate-slow-bounce
              ${isDark ? 'bg-slate-400/80' : 'bg-slate-500/80'}`}
              style={{ animationDelay: '200ms' }}
            />
            <span className={`w-3.5 h-3.5 rounded-full animate-slow-bounce
              ${isDark ? 'bg-slate-400/80' : 'bg-slate-500/80'}`}
              style={{ animationDelay: '400ms' }}
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes slowBounce {
            0%, 100% { transform: translateY(0); opacity: 0.5; }
            50%      { transform: translateY(-10px); opacity: 1; }
          }

          .animate-slow-bounce {
            animation: slowBounce 1.8s infinite ease-in-out;
          }
        `}</style>
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
      theme={theme}              // ← pass theme down
      onThemeChange={setTheme}   // ← pass setter so SettingsPage can change it
    />
  )
}

export default AppRoot
