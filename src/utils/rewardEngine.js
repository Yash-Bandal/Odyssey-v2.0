    import { toLocalDateKey } from "../utils/date"

    export async function computeAndUpdateRewards({
        user,
        semester,
        supabase,
    }) {
        if (!user?.id || !semester?.id) return null

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
            { key: "7_day_streak", title: "7 Day Streak", threshold: 7 },
            { key: "30_day_streak", title: "30 Day Streak", threshold: 30 },
            { key: "100_day_streak", title: "100 Day Streak", threshold: 100 },
        ]

        const { data, error } = await supabase
            .from("sessions")
            .select("start_time, end_time, duration_minutes, type")
            .eq("user_id", user.id)
            .eq("semester_id", semester.id)
            .order("start_time", { ascending: true })
            .limit(5000)

        if (error || !data) return null

        const todayKey = toLocalDateKey(new Date())
        let todayMinutes = 0
        let nightOwlToday = false
        const todayStarts = []
        const pomodoroDayKeys = new Set()

        data.forEach((session) => {
            const start = new Date(session.start_time)
            const end = new Date(session.end_time || session.start_time)
            const minutes = Number(session.duration_minutes) || 0

            if (toLocalDateKey(start) === todayKey) {
                todayMinutes += minutes
                todayStarts.push(start)
                if (start.getHours() >= 23) nightOwlToday = true
            }

            if (session.type === "pomodoro") {
                pomodoroDayKeys.add(toLocalDateKey(end))
            }
        })

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

        const build = (def, unlocked) => ({
            key: def.key,
            title: def.title,
            subtitle:
                def.threshold
                    ? `${def.threshold}+ minutes today`
                    : def.subtitle,
            unlocked: Boolean(unlocked),
            unlockCount: unlocked ? 1 : 0,
        })

        return {
            timing: dailyTimingDefs.map((def) =>
                build(def, dailyConditions[def.key])
            ),
            time: dailyTimeDefs.map((def) =>
                build(def, dailyConditions[def.key])
            ),
            streak: streakDefs.map((def) =>
                build(def, streakConditions[def.key])
            ),
        }
    }