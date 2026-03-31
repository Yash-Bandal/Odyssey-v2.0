import { toLocalDateKey } from "../utils/date"

export async function computeAndUpdateRewards({
    user,
    semester,
    supabase,
}) {
    if (!user?.id || !semester?.id) return null

    // =========================
    // 1. Definitions
    // =========================
    const dailyTimingDefs = [
        { key: "early_bird", title: "Early Bird", subtitle: "First session starts before 7:00 AM" },
        { key: "night_owl", title: "Night Owl", subtitle: "Any session starts after 11:00 PM" },
    ]

    const dailyTimeDefs = [
        { key: "2_hours", title: "2 Hours", threshold: 120 },
        { key: "4_hours", title: "4 Hours", threshold: 240 },
        { key: "6_hours", title: "6 Hours", threshold: 360 },
        { key: "8_hours", title: "8 Hours", threshold: 480 },
        { key: "10_hours", title: "10 Hours", threshold: 600 },
        { key: "12_hours", title: "12 Hours", threshold: 720 },
    ]

    const streakDefs = [
        { key: "7_day_streak", title: "7 Day Streak", subtitle: "7 Days Streak! Keep Going" },
        { key: "30_day_streak", title: "30 Day Streak", subtitle: "1 Month Streak | You are very close to Goal"},
        { key: "100_day_streak", title: "100 Day Streak", subtitle: "You are exceptional!" },
    ]

    // =========================
    // 2. Fetch sessions
    // =========================
    const { data: sessions, error } = await supabase
        .from("sessions")
        .select("start_time, end_time, duration_minutes, type")
        .eq("user_id", user.id)
        .eq("semester_id", semester.id)
        .order("start_time", { ascending: true })
        .limit(5000)

    if (error || !sessions) return null

    // =========================
    // 3. Fetch existing rewards
    // =========================
    const { data: existingRewards } = await supabase
        .from("user_rewards")
        .select("reward_key, unlock_count, last_unlocked_date")
        .eq("user_id", user.id)

    const rewardsMap = new Map(
        (existingRewards || []).map((r) => [r.reward_key, r])
    )

    // =========================
    // 4. Compute today's stats
    // =========================
    const todayKey = toLocalDateKey(new Date())

    let todayMinutes = 0
    let nightOwlToday = false
    const todayStarts = []
    const pomodoroDayKeys = new Set()

    sessions.forEach((session) => {
        const start = new Date(session.start_time)
        const end = new Date(session.end_time || session.start_time)
        const minutes = Number(session.duration_minutes) || 0

        const startKey = toLocalDateKey(start)
        const endKey = toLocalDateKey(end)

        if (startKey === todayKey) {
            todayMinutes += minutes
            todayStarts.push(start)

            if (start.getHours() >= 23) {
                nightOwlToday = true
            }
        }

        if (session.type === "pomodoro") {
            pomodoroDayKeys.add(endKey)
        }
    })

    // =========================
    // 5. Streak calculation
    // =========================
    let streakDays = 0
    const cursor = new Date()

    while (pomodoroDayKeys.has(toLocalDateKey(cursor))) {
        streakDays++
        cursor.setDate(cursor.getDate() - 1)
    }

    const firstTodayStart =
        todayStarts.length > 0
            ? new Date(Math.min(...todayStarts.map((d) => d.getTime())))
            : null

    // =========================
    // 6. Conditions
    // =========================
    const dailyConditions = {
        early_bird: firstTodayStart && firstTodayStart.getHours() < 7,
        night_owl: nightOwlToday,
    }

    dailyTimeDefs.forEach((def) => {
        dailyConditions[def.key] = todayMinutes >= def.threshold
    })

    const streakConditions = {
        "7_day_streak": streakDays >= 7,
        "30_day_streak": streakDays >= 30,
        "100_day_streak": streakDays >= 100,
    }

    // =========================
    // 7. Build + Persist
    // =========================
    const buildReward = async (def, unlocked) => {
        const existing = rewardsMap.get(def.key)

        const existingCount = existing?.unlock_count || 0
        const lastUnlocked = existing?.last_unlocked_date

        let newCount = existingCount

        // 🔥 Core fix: increment only once per day
        if (unlocked && lastUnlocked !== todayKey) {
            newCount = existingCount + 1

            await supabase.from("user_rewards").upsert({
                user_id: user.id,
                reward_key: def.key,
                unlock_count: newCount,
                last_unlocked_date: todayKey,
            })
        }

        return {
            key: def.key,
            title: def.title,
            subtitle: def.threshold
                ? `${def.threshold}+ minutes today`
                : def.subtitle,
            unlocked: Boolean(unlocked),
            unlockCount: newCount,
        }
    }

    // =========================
    // 8. Return all rewards
    // =========================
    const timing = await Promise.all(
        dailyTimingDefs.map((def) =>
            buildReward(def, dailyConditions[def.key])
        )
    )

    const time = await Promise.all(
        dailyTimeDefs.map((def) =>
            buildReward(def, dailyConditions[def.key])
        )
    )

    const streak = await Promise.all(
        streakDefs.map((def) =>
            buildReward(def, streakConditions[def.key])
        )
    )

    return {
        timing,
        time,
        streak,
    }
}


//================31 march before code

// import { toLocalDateKey } from "../utils/date"

    // export async function computeAndUpdateRewards({
    //     user,
    //     semester,
    //     supabase,
    // }) {
    //     if (!user?.id || !semester?.id) return null

    //     const dailyTimingDefs = [
    //         { key: "early_bird", title: "Early Bird", subtitle: "First session starts before 7:00 AM" },
    //         { key: "night_owl", title: "Night Owl", subtitle: "Any session starts after 11:00 PM" },
    //     ]

    //     const dailyTimeDefs = [
    //         { key: "2_hours", title: "2 Hours", threshold: 120 },
    //         { key: "4_hours", title: "4 Hours", threshold: 240 },
    //         { key: "6_hours", title: "6 Hours", threshold: 360 },
    //         { key: "8_hours", title: "8 Hours", threshold: 480 },
    //         { key: "10_hours", title: "10 Hours", threshold: 600 },
    //         { key: "12_hours", title: "12 Hours", threshold: 720 },
    //     ]

    //     // const streakDefs = [
    //     //     { key: "7_day_streak", title: "7 Day Streak", threshold: 7 },
    //     //     { key: "30_day_streak", title: "30 Day Streak", threshold: 30 },
    //     //     { key: "100_day_streak", title: "100 Day Streak", threshold: 100 },
    //     // ]

    //     const streakDefs = [
    //         { key: "7_day_streak", title: "7 Day Streak", subtitle: "7 Days Streak! Keep Going" },
    //         { key: "30_day_streak", title: "30 Day Streak", subtitle: "1 Month Streak | You are very close to Goal"},
    //         { key: "100_day_streak", title: "100 Day Streak", subtitle: "You are exceptional!" },
    //     ]

    //     const { data, error } = await supabase
    //         .from("sessions")
    //         .select("start_time, end_time, duration_minutes, type")
    //         .eq("user_id", user.id)
    //         .eq("semester_id", semester.id)
    //         .order("start_time", { ascending: true })
    //         .limit(5000)

    //     if (error || !data) return null
    //     const { data: existingRewards } = await supabase
    //         .from("user_rewards")
    //         .select("reward_key, unlock_count")
    //         .eq("user_id", user.id)

    //     const rewardsMap = new Map(
    //         (existingRewards || []).map((row) => [
    //             row.reward_key,
    //             Number(row.unlock_count) || 0,
    //         ])
    //     )
        

    //     const todayKey = toLocalDateKey(new Date())
    //     let todayMinutes = 0
    //     let nightOwlToday = false
    //     const todayStarts = []
    //     const pomodoroDayKeys = new Set()

    //     data.forEach((session) => {
    //         const start = new Date(session.start_time)
    //         const end = new Date(session.end_time || session.start_time)
    //         const minutes = Number(session.duration_minutes) || 0

    //         if (toLocalDateKey(start) === todayKey) {
    //             todayMinutes += minutes
    //             todayStarts.push(start)
    //             if (start.getHours() >= 23) nightOwlToday = true
    //         }

    //         if (session.type === "pomodoro") {
    //             pomodoroDayKeys.add(toLocalDateKey(end))
    //         }
    //     })

    //     let streakDays = 0
    //     const cursor = new Date()
    //     while (pomodoroDayKeys.has(toLocalDateKey(cursor))) {
    //         streakDays++
    //         cursor.setDate(cursor.getDate() - 1)
    //     }

    //     const firstTodayStart =
    //         todayStarts.length > 0
    //             ? new Date(Math.min(...todayStarts.map((d) => d.getTime())))
    //             : null

    //     const dailyConditions = {
    //         early_bird: firstTodayStart && firstTodayStart.getHours() < 7,
    //         night_owl: nightOwlToday,
    //     }

    //     dailyTimeDefs.forEach((def) => {
    //         dailyConditions[def.key] = todayMinutes >= def.threshold
    //     })

    //     const streakConditions = {
    //         "7_day_streak": streakDays >= 7,
    //         "30_day_streak": streakDays >= 30,
    //         "100_day_streak": streakDays >= 100,
    //     }

    //     // const build = (def, unlocked) => ({
    //     //     key: def.key,
    //     //     title: def.title,
    //     //     subtitle:
    //     //         def.threshold
    //     //             ? `${def.threshold}+ minutes today`
    //     //             : def.subtitle,
    //     //     unlocked: Boolean(unlocked),
    //     //     unlockCount: unlocked ? 1 : 0,
    //     // })
    //     const build = (def, unlocked) => {
    //         const existingCount = rewardsMap.get(def.key) || 0

    //         return {
    //             key: def.key,
    //             title: def.title,
    //             subtitle:
    //                 def.threshold
    //                     ? `${def.threshold}+ minutes today`
    //                     : def.subtitle,
    //             unlocked: Boolean(unlocked),
    //             unlockCount: existingCount,
    //         }
    //     }


    //     return {
    //         timing: dailyTimingDefs.map((def) =>
    //             build(def, dailyConditions[def.key])
    //         ),
    //         time: dailyTimeDefs.map((def) =>
    //             build(def, dailyConditions[def.key])
    //         ),
    //         streak: streakDefs.map((def) =>
    //             build(def, streakConditions[def.key])
    //         ),
    //     }
    // }
