import {
  LayoutDashboard,
  Timer,
  CalendarDays,
  BarChart3,
  Sun,
  Flame,
  Clock3,
} from 'lucide-react'

function StatCard({ label, value, sublabel, accent, isDark = false }) {
  const statCardIcons = {
    Today: Sun,
    'This week': CalendarDays,
    'This month': CalendarDays,
    'Current streak': Flame,
    Sessions: Timer,
    'Total Time': Clock3,
    'Avg / Session': BarChart3,
  }
  const Icon = statCardIcons[label] || LayoutDashboard

  return (
    // <div
    //   className={[
    //     'rounded-2xl shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-2',
    //     isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-100',
    //   ].join(' ')}
    // >
    //   <div className="flex items-center justify-between gap-2">
    //     <div
    //       className={[
    //         'text-xs font-medium uppercase tracking-[0.16em]',
    //         isDark ? 'text-slate-400' : 'text-slate-500',
    //       ].join(' ')}
    //     >
    //       {label}
    //     </div>
    //     <div className="flex items-center gap-1.5">
    //       {accent && (
    //         <span
    //           className={[
    //             'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
    //             isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700',
    //           ].join(' ')}
    //         >
    //           {accent}
    //         </span>
    //       )}
    //       <span
    //         className={[
    //           'inline-flex h-6 w-6 items-center justify-center rounded-full',
    //           isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600',
    //         ].join(' ')}
    //       >
    //         <Icon size={13} strokeWidth={2.2} />
    //       </span>
    //     </div>
    //   </div>
    //   <div className={['text-xl sm:text-2xl font-semibold tracking-tight', isDark ? 'text-slate-100' : 'text-slate-900'].join(' ')}>
    //     {value}
    //   </div>
    //   {sublabel && (
    //     <div className={['text-xs', isDark ? 'text-slate-400' : 'text-slate-500'].join(' ')}>
    //       {sublabel}
    //     </div>
    //   )}
    // </div>

            <div
              className={[
                'relative rounded-3xl px-6 py-5 transition-all duration-200',
                // 'shadow-[0_4px_20px_rgba(0,0,0,0.04)]',
                'shadow-sm',
                isDark
                  ? 'bg-slate-900 border border-slate-800'
                  : 'bg-white border border-slate-200',
              ].join(' ')}
            >
              {/* Top Row */}
              <div className="flex items-start justify-between">
        
                <div>
                  <div
                    className={[
                      'text-[11px] font-semibold uppercase tracking-[0.18em]',
                      isDark ? 'text-slate-400' : 'text-slate-500',
                    ].join(' ')}
                  >
                    {label}
                  </div>
        
                  <div
                    className={[
                      'mt-3 text-2xl font-bold tracking-tight',
                      isDark ? 'text-white' : 'text-slate-900',
                    ].join(' ')}
                  >
                    {value}
                  </div>
                </div>
        
                {/* Icon Badge */}
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-xl shadow-sm',
                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600',
                  ].join(' ')}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>
              </div>
        
              {/* Bottom Row */}
              {(accent || sublabel) && (
                <div className="mt-4 flex items-center justify-between">
        
                  {accent && (
                    <span
                      className={[
                        'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                        isDark
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-emerald-50 text-emerald-700',
                      ].join(' ')}
                    >
                      {accent}
                    </span>
                  )}
        
                  {sublabel && (
                    <div
                      className={[
                        'text-xs',
                        isDark ? 'text-slate-400' : 'text-slate-500',
                      ].join(' ')}
                    >
                      {sublabel}
                    </div>
                  )}
                </div>
              )}
    </div>

    
  )
}

function SectionCard({ title, children, headerRight }) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-slate-100 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {headerRight}
      </div>
      <div className="text-xs text-slate-500">
        {children}
      </div>
    </section>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 px-4 py-6 sm:px-6 sm:py-8 flex flex-col gap-3 items-start">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-[0.16em]">
        Odyssey
      </div>
      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
        {title}
      </h1>
      <p className="text-sm text-slate-500 max-w-xl">
        This section will be powered in a later phase. The layout and routing
        are ready so we can plug in timers, analytics, and rewards without
        restructuring the UI.
      </p>
    </div>
  )
}


export {
  StatCard,
  SectionCard,
  PlaceholderPage,
}
