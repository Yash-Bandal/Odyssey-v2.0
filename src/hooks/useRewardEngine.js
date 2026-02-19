// import { useEffect } from "react"
// import Swal from "sweetalert2"
// import { supabase } from "../supabaseClient"
// import { REWARD_ICONS } from "../constants/rewards"
// import { toLocalDateKey } from "../utils/date"

// export function useRewardEngine(user, semester, sessionsVersion) {
//     useEffect(() => {
//         if (!user?.id || !semester?.id) return

//         const run = async () => {
//             const todayKey = toLocalDateKey(new Date())
//             const newlyUnlocked = []

//             // Load sessions
//             const { data: sessions } = await supabase
//                 .from("sessions")
//                 .select("start_time, end_time, duration_minutes, type")
//                 .eq("user_id", user.id)
//                 .eq("semester_id", semester.id)

//             if (!sessions) return

//             let todayMinutes = 0
//             let nightOwlToday = false
//             const todayStarts = []
//             const pomodoroDays = new Set()

//             sessions.forEach((session) => {
//                 const start = new Date(session.start_time)
//                 const end = new Date(session.end_time || session.start_time)
//                 const minutes = Number(session.duration_minutes) || 0

//                 if (toLocalDateKey(start) === todayKey) {
//                     todayMinutes += minutes
//                     todayStarts.push(start)
//                     if (start.getHours() >= 23) nightOwlToday = true
//                 }

//                 if (session.type === "pomodoro") {
//                     pomodoroDays.add(toLocalDateKey(end))
//                 }
//             })

//             const firstStart =
//                 todayStarts.length > 0
//                     ? new Date(Math.min(...todayStarts.map((d) => d.getTime())))
//                     : null

//             const streakDays = (() => {
//                 let count = 0
//                 const cursor = new Date()
//                 while (pomodoroDays.has(toLocalDateKey(cursor))) {
//                     count++
//                     cursor.setDate(cursor.getDate() - 1)
//                 }
//                 return count
//             })()

//             const conditions = {
//                 early_bird: firstStart && firstStart.getHours() < 7,
//                 night_owl: nightOwlToday,
//                 "2_hours": todayMinutes >= 120,
//                 "4_hours": todayMinutes >= 240,
//                 "6_hours": todayMinutes >= 360,
//                 "8_hours": todayMinutes >= 480,
//                 "10_hours": todayMinutes >= 600,
//                 "12_hours": todayMinutes >= 720,
//                 "7_day_streak": streakDays >= 7,
//                 "30_day_streak": streakDays >= 30,
//                 "100_day_streak": streakDays >= 100,
//             }

//             const { data: existingRewards } = await supabase
//                 .from("user_rewards")
//                 .select("reward_key, unlock_count, last_unlocked_date")
//                 .eq("user_id", user.id)

//             const rewardsMap = new Map(
//                 (existingRewards || []).map((r) => [r.reward_key, r])
//             )

//             for (const key in conditions) {
//                 if (!conditions[key]) continue

//                 const existing = rewardsMap.get(key)
//                 const lastDate = existing?.last_unlocked_date
//                 const currentCount = Number(existing?.unlock_count) || 0

//                 // DAILY RESET BADGES
//                 const isDaily =
//                     key.includes("_hours") ||
//                     key === "early_bird" ||
//                     key === "night_owl"

//                 if (isDaily) {
//                     if (lastDate !== todayKey) {
//                         await supabase.from("user_rewards").upsert(
//                             {
//                                 user_id: user.id,
//                                 reward_key: key,
//                                 unlock_count: currentCount + 1,
//                                 last_unlocked_date: todayKey,
//                             },
//                             { onConflict: "user_id,reward_key" }
//                         )
//                         newlyUnlocked.push(key)
//                     }
//                 } else {
//                     // streak badges (unlock once)
//                     if (!existing) {
//                         await supabase.from("user_rewards").upsert(
//                             {
//                                 user_id: user.id,
//                                 reward_key: key,
//                                 unlock_count: 1,
//                                 last_unlocked_date: todayKey,
//                             },
//                             { onConflict: "user_id,reward_key" }
//                         )
//                         newlyUnlocked.push(key)
//                     }
//                 }
//             }

//             // 🔥 SHOW ALERTS
//             for (const key of newlyUnlocked) {
//                 await Swal.fire({
//                     title: "Achievement Unlocked!",
//                     imageUrl: REWARD_ICONS[key],
//                     imageWidth: 180,
//                     imageHeight: 180,
//                     confirmButtonColor: "#0ea5e9",
//                 })
//             }
//         }

//         run()
//     }, [sessionsVersion])
// }
