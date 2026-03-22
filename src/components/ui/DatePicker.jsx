import { useEffect, useRef, useState } from "react"
import { DayPicker } from "react-day-picker"
import { Calendar } from "lucide-react"

// import "react-day-picker/dist/style.css"
const currentYear = new Date().getFullYear()   
// console.log(currentYear)

export default function DatePicker({
    value,
    onChange,
    isDark,
    disableFuture = false
}) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)

    // Safe local date parsing (no timezone shifting)
    const selectedDate = value
        ? new Date(value + "T00:00:00")
        : undefined

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const formatLocalDate = (date) => {
        return `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    }

    const handleSelect = (date) => {
        if (!date) return
        onChange(formatLocalDate(date))
        setOpen(false)
    }

    const goToday = () => {
        const today = new Date()
        onChange(formatLocalDate(today))
        setOpen(false)
    }

    return (
        <div ref={ref} className="relative w-full">
            {/* Trigger Input */}
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={[
                    "w-full flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500",
                    isDark
                        ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                ].join(" ")}
            >
                <span>
                    {selectedDate
                        ? selectedDate.toLocaleDateString()
                        : "Select date"}
                </span>
                <Calendar
                    size={16}
                    className={isDark ? "text-slate-300" : "text-slate-500"}
                />
            </button>

            {/* Calendar Popover */}
            {open && (
                <div
                    className={[
                        "absolute z-50 mt-3 rounded-2xl border shadow-xl p-4 w-[300px]",
                        isDark
                            ? "bg-slate-900 border-slate-800"
                            : "bg-white border-slate-200"
                    ].join(" ")}
                >
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleSelect}
                        captionLayout="dropdown"
                        // fromYear={2022}
                        // toYear={2032}
                        fromYear={currentYear - 4}
                        toYear={currentYear + 5}
                        disabled={disableFuture ? { after: new Date() } : undefined}
                        className="w-full"
                        classNames={{
                            nav: "hidden",
                            caption_label: "hidden",
                            caption: "flex justify-between items-center px-2",
                            months: "flex justify-center",
                            month: "space-y-4",
                            // caption_label: "text-sm font-semibold",
                            // nav: "flex items-center gap-1",
                            // nav_button:"h-7 w-7 rounded-md hover:bg-sky-500/10 flex items-center justify-center",
                            table: "w-full border-collapse",
                            head_row: "flex",
                            head_cell:
                                "text-xs font-medium w-9 text-center text-slate-400",
                            row: "flex w-full mt-1",
                            cell: "w-9 h-9 text-center text-sm p-0 relative",
                            day: "h-9 w-9 rounded-full hover:bg-sky-500/15 transition text-center",
                            day_selected:
                                "bg-sky-500 text-white hover:bg-sky-600",
                            day_today:
                                "border border-sky-500 rounded-full",
                            // dropdown:
                            //     "bg-transparent text-sm rounded-md px-1 py-0.5 focus:outline-none",
                            // dropdown_month:
                            //     "text-sm font-medium",
                            // dropdown_year:
                            //     "text-sm font-medium"
                            dropdown: [
                                "text-sm rounded-md px-2 py-1 border focus:outline-none",
                                isDark
                                    ? "bg-slate-800 text-slate-200 border-slate-700"
                                    : "bg-white text-slate-700 border-slate-300"
                            ].join(" ")
                        }}
                    />

                    {/* Footer */}
                    <div
                        className={[
                            "flex justify-between items-center pt-3 mt-3 border-t text-sm",
                            isDark
                                ? "border-slate-800"
                                : "border-slate-200"
                        ].join(" ")}
                    >
                        <button
                            onClick={goToday}
                            className="text-sky-500 hover:text-sky-600 font-medium"
                        >
                            Today
                        </button>

                        <button
                            onClick={() => {
                                onChange("")
                                setOpen(false)
                            }}
                            className="text-slate-400 hover:text-red-500"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// import { useEffect, useRef, useState } from "react"
// import { DayPicker } from "react-day-picker"
// // import "react-day-picker/dist/style.css"
// import { Calendar } from "lucide-react"

// export default function DatePicker({
//     value,
//     onChange,
//     isDark,
//     disableFuture = false
// }) {
//     const [open, setOpen] = useState(false)
//     const ref = useRef(null)

//     const selectedDate = value ? new Date(value) : undefined

//     // Close on outside click
//     useEffect(() => {
//         function handleClickOutside(event) {
//             if (ref.current && !ref.current.contains(event.target)) {
//                 setOpen(false)
//             }
//         }
//         document.addEventListener("mousedown", handleClickOutside)
//         return () => document.removeEventListener("mousedown", handleClickOutside)
//     }, [])

//     const handleSelect = (date) => {
//         if (!date) return
//         onChange(date)
//         setOpen(false)
//     }

//     const goToday = () => {
//         const today = new Date()
//         onChange(today)
//         setOpen(false)
//     }

//     return (
//         <div ref={ref} className="relative w-full">
//             {/* Trigger */}
//             <button
//                 type="button"
//                 onClick={() => setOpen((prev) => !prev)}
//                 className={[
//                     "w-full flex items-center justify-between rounded-xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500",
//                     isDark
//                         ? "bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800"
//                         : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
//                 ].join(" ")}
//             >
//                 <span>
//                     {selectedDate
//                         ? selectedDate.toLocaleDateString()
//                         : "Select date"}
//                 </span>
//                 <Calendar
//                     size={16}
//                     className={isDark ? "text-slate-300" : "text-slate-500"}
//                 />
//             </button>

//             {/* Calendar Popover */}
//             {open && (
//                 <div
//                     className={[
//                         "absolute z-50 mt-3 rounded-2xl border shadow-2xl p-4 w-[280px] animate-in fade-in zoom-in-95",
//                         isDark
//                             ? "bg-slate-900 border-slate-800"
//                             : "bg-white border-slate-200"
//                     ].join(" ")}
//                 >
//                     {/* <DayPicker
//                         mode="single"
//                         selected={selectedDate}
//                         onSelect={handleSelect}
//                         captionLayout="dropdown"
//                         fromYear={2022}
//                         toYear={2030}
//                         disabled={disableFuture ? { after: new Date() } : undefined}
//                     /> */}

//                     <DayPicker
//                         mode="single"
//                         selected={selectedDate}
//                         onSelect={handleSelect}
//                         captionLayout="dropdown"
//                         fromYear={2022}
//                         toYear={2035}
//                         disabled={disableFuture ? { after: new Date() } : undefined}
//                         className="w-full"
//                         classNames={{
//                             // months: "flex justify-center",
//                             month: "space-y-4",
//                             // caption: "flex justify-between items-center px-2 mb-2",
//                             caption_label: "hidden",
//                             // nav: "flex items-center gap-1",
//                             nav: "hidden",
//                             // nav_button:"h-7 w-7 rounded-md hover:bg-sky-500/10 flex items-center justify-center text-slate-400",
//                             // table: "w-full border-collapse",
//                             // head_row: "flex",
//                             // head_cell:"text-xs font-medium w-9 text-center text-slate-400",
//                             // row: "flex w-full mt-1",
//                             // cell: "w-9 h-9 text-center text-sm p-0 relative",
//                             day: "h-9 w-9 rounded-full hover:bg-sky-500/15 transition text-slate-300",
//                             // day_selected:"bg-sky-500 text-white hover:bg-sky-600",
//                             // day_today: "border border-sky-500",
//                             dropdown:
//                                 "bg-slate-800 text-slate-200 text-sm rounded-md px-2 py-1 border border-slate-700 focus:outline-none",
//                             dropdown_month:
//                                 "font-medium",
//                             dropdown_year:
//                                 "font-medium"
//                         }}
//                     />

//                     {/* Footer Actions */}
//                     <div className="flex justify-between items-center pt-3 border-t mt-3 text-sm">
//                         <button
//                             onClick={goToday}
//                             className="text-sky-500 hover:text-sky-600 font-medium"
//                         >
//                             Today
//                         </button>

//                         <button
//                             onClick={() => {
//                                 onChange(null)
//                                 setOpen(false)
//                             }}
//                             className="text-slate-400 hover:text-red-500"
//                         >
//                             Clear
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

