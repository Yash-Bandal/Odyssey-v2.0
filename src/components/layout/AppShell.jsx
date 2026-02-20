import { NavLink, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from '../../assets/logo.png'
import { navItems } from '../../constants/navigation'
import DashboardPage from '../../pages/Dashboard'
import SessionsPage from '../../pages/Sessions'
import CalendarPage from '../../pages/Calendar'
import GoalsPage from '../../pages/Goals'
import RewardsPage from '../../pages/Rewards'
import AnalyticsPage from '../../pages/Analytics'
import SettingsPage from '../../pages/Settings'

function AppShell({ user, semester, onSignOut, sessionsVersion, onSessionsChanged, onSemesterChanged }) {

  // Date + Time display
  const [label, setLabel] = useState("")

  useEffect(() => {
    const update = () => {
      const now = new Date()

      const datePart = now.toLocaleDateString(undefined, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })

      const timePart = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })

      setLabel(`${datePart} • ${timePart}`)
    }

    update() // initial
    const interval = setInterval(update, 60000) // every minute

    return () => clearInterval(interval)
  }, [])

  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = window.localStorage.getItem('odyssey:theme')
    return saved === 'dark' ? 'dark' : 'light'
  })

  const navigate = useNavigate()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('odyssey:theme', theme)
  }, [theme])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!mobileNavOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileNavOpen])

  const profileInitial =
    user?.email && typeof user.email === 'string' && user.email.length
      ? user.email[0].toUpperCase()
      : 'O'

  return (
    <div
      className={[
        'h-screen flex overflow-hidden',
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900',
      ].join(' ')}
    >
      {/* Desktop Sidebar – full height, always visible on lg+ */}
      <aside
        className={[
          'hidden lg:flex lg:flex-col transition-all duration-300',
          isDark ? 'bg-[#0f1118] text-white' : 'bg-[#0b0c10] text-white',
          desktopSidebarOpen ? 'lg:w-64' : 'lg:w-20',
          'h-screen overflow-hidden',
        ].join(' ')}
      >
        <div className="border-b-[0.5px] border-white/20">
          <div className="font-sans flex items-center justify-between p-4 font-bold text-lg tracking-widest">
            {desktopSidebarOpen && (
              <div className='flex gap-2'>
                <img
                  src={Logo}
                  alt="Odyssey Logo"
                  className="h-5 w-5 sm:h-6 sm:w-6 object-contain flex-shrink-0"
                />
                <span>Odyssey</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((open) => !open)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 transition-colors"
              title={desktopSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'group flex items-center rounded-xl transition-colors duration-300',
                    desktopSidebarOpen ? 'justify-between px-3 py-2 text-sm' : 'justify-center h-10',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
                end={item.to === '/'}
                title={desktopSidebarOpen ? '' : item.label}
              >
                <div className={['flex items-center', desktopSidebarOpen ? 'gap-2.5' : 'gap-0'].join(' ')}>
                  <Icon size={17} strokeWidth={2} />
                  {desktopSidebarOpen && <span>{item.label}</span>}
                </div>
                {desktopSidebarOpen && item.label === 'Dashboard' && (
                  <span className="text-[10px] rounded-lg px-2 py-0.5 bg-sky-400/20 text-sky-200">
                    Live
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        <div className="px-3 pb-4">
          <button
            type="button"
            onClick={onSignOut}
            className={[
              'w-full flex items-center rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors',
              desktopSidebarOpen ? 'justify-center gap-2' : 'justify-center',
            ].join(' ')}
            title={desktopSidebarOpen ? '' : 'Log out'}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {desktopSidebarOpen && 'Log out'}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={[
          'fixed inset-0 z-50 md:hidden transition-opacity duration-300',
          mobileNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <button
          type="button"
          aria-label="Close sidebar"
          className="absolute inset-0 bg-slate-950/55"
          onClick={() => setMobileNavOpen(false)}
        />

        <aside
          className={[
            'absolute inset-y-0 left-0 w-72 flex flex-col overflow-hidden transition-transform duration-300',
            isDark ? 'bg-[#0f1118] text-white' : 'bg-[#101322] text-white',
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full',
          ].join(' ')}
        >
          <div className="border-b-[0.5px] border-white/20">
            <div className="flex items-center justify-between p-4 font-bold text-lg tracking-widest uppercase">
              <span>Odyssey</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 transition-colors"
                title="Close sidebar"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      'group flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-300',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white',
                    ].join(' ')
                  }
                  end={item.to === '/'}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={17} strokeWidth={2} />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Dashboard' && (
                    <span className="text-[10px] rounded-lg px-2 py-0.5 bg-sky-400/20 text-sky-200">
                      Live
                    </span>
                  )}
                </NavLink>
              )
            })}
          </nav>

          <div className="px-3 pb-4">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Log out
            </button>
          </div>
        </aside>
      </div>

      {/* Main Content Area */}
      <div className={[
        'flex-1 flex flex-col overflow-hidden',
        isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900',
      ].join(' ')}>

        <header className={[
          'border-b backdrop-blur',
          isDark ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80',
        ].join(' ')}>
          <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen((open) => !open)}
                className={`inline-flex items-center justify-center rounded-xl md:hidden 
                  ${isDark
                    ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  } h-10 w-10 transition-all duration-200`}
              >
                {mobileNavOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              <div className="flex flex-col">
                <div className={`sm:hidden text-xs font-bold uppercase tracking-[0.16em] 
                  ${isDark ? 'text-white' : 'text-black'}`}>
                  Odyssey
                </div>

                <div
                  className={`max-sm:hidden flex items-center gap-3 px-3 py-1.5 rounded-full border ${isDark
                      ? 'bg-slate-800 border-slate-700'
                      : 'bg-white border-slate-200'
                    }`}
                >
                  <svg
                    className={`h-4 w-4 flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>

                  <span className={`text-sm font-medium tracking-[0.05em] ${isDark ? 'text-slate-300' : 'text-black'}`}>
                    {label}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate('/sessions')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 text-slate-50 px-3 py-1.5 text-xs sm:text-sm font-medium shadow-sm hover:bg-slate-800"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Timer
              </button>

              <div className="relative">
                <button
                  type="button"
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-xl border shadow-sm ${isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  onClick={() => setProfileMenuOpen((open) => !open)}
                >
                  {profileInitial}
                </button>

                {profileMenuOpen && (
                  <div className={`absolute right-0 mt-2 w-44 rounded-2xl shadow-lg border py-1 text-xs z-10 ${isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                    <div className={`px-3 py-2 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'
                      }`}>
                      <div className="font-semibold truncate">
                        {user?.email || 'Account'}
                      </div>
                      {semester && (
                        <div className="text-[11px] text-slate-400">
                          Active semester
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={onSignOut}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
                        }`}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8 max-w-7xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <DashboardPage
                    user={user}
                    semester={semester}
                    sessionsVersion={sessionsVersion}
                    onSemesterChanged={onSemesterChanged}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/sessions"
                element={
                  <SessionsPage
                    user={user}
                    semester={semester}
                    onSessionsChanged={onSessionsChanged}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/calendar"
                element={
                  <CalendarPage
                    user={user}
                    semester={semester}
                    sessionsVersion={sessionsVersion}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/goals"
                element={
                  <GoalsPage
                    user={user}
                    semester={semester}
                    onSemesterChanged={onSemesterChanged}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/rewards"
                element={
                  <RewardsPage
                    user={user}
                    semester={semester}
                    sessionsVersion={sessionsVersion}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/analytics"
                element={
                  <AnalyticsPage
                    user={user}
                    semester={semester}
                    sessionsVersion={sessionsVersion}
                    isDark={isDark}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <SettingsPage
                    theme={theme}
                    onThemeChange={(nextTheme) => setTheme(nextTheme)}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>

        

        
      </div>
      
    </div>
  )
}

export default AppShell

