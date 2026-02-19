import {
  LayoutDashboard,
  Timer,
  CalendarDays,
  Target,
  Trophy,
  BarChart3,
  Settings,
} from 'lucide-react'

export const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Sessions', to: '/sessions', icon: Timer },
  { label: 'Rewards', to: '/rewards', icon: Trophy },
  { label: 'Goals', to: '/goals', icon: Target },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Settings', to: '/settings', icon: Settings },
]
