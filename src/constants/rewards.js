import EarlyBird from '../assets/rewards/EarlyBird.png'
import NightOwl from '../assets/rewards/NightOwl.png'
import TwoHours from '../assets/rewards/TwoHours.png'
import FourHours from '../assets/rewards/FourHours.png'
import SixHours from '../assets/rewards/SixHours.png'
import EightHours from '../assets/rewards/EightHours.png'
import TenHours from '../assets/rewards/TenHours.png'
import TwelveHours from '../assets/rewards/TwelveHours.png'
import SevenDayStreak from '../assets/rewards/SevenDayStreak.png'
import ThirtyDayStreak from '../assets/rewards/ThirtyDayStreak.png'
import HundredDayStreak from '../assets/rewards/HundredDayStreak.png'

export const REWARD_ICONS = {
  early_bird: EarlyBird,
  night_owl: NightOwl,
  '2_hours': TwoHours,
  '4_hours': FourHours,
  '6_hours': SixHours,
  '8_hours': EightHours,
  '10_hours': TenHours,
  '12_hours': TwelveHours,
  '7_day_streak': SevenDayStreak,
  '30_day_streak': ThirtyDayStreak,
  '100_day_streak': HundredDayStreak,
}

export const TIME_BADGES = [
  { key: '2_hours', label: '2 Hours', thresholdMinutes: 120 },
  { key: '4_hours', label: '4 Hours', thresholdMinutes: 240 },
  { key: '6_hours', label: '6 Hours', thresholdMinutes: 360 },
  { key: '8_hours', label: '8 Hours', thresholdMinutes: 480 },
  { key: '10_hours', label: '10 Hours', thresholdMinutes: 600 },
  { key: '12_hours', label: '12 Hours', thresholdMinutes: 720 },
]
