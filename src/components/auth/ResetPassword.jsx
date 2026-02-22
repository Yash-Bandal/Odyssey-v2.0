// import { useState } from "react"
// import { supabase } from "../../supabaseClient"

// function ResetPassword() {
//     const [password, setPassword] = useState("")
//     const [message, setMessage] = useState("")

//     const handleUpdate = async (e) => {
//         e.preventDefault()

//         const { error } = await supabase.auth.updateUser({
//             password,
//         })

//         if (error) {
//             setMessage(error.message)
//         } else {
//             setMessage("Password updated successfully. You can now log in.")
//         }
//     }

//     return (
//         <div className="min-h-screen flex items-center justify-center">
//             <form onSubmit={handleUpdate} className="space-y-4">
//                 <input
//                     type="password"
//                     placeholder="New password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="border px-4 py-2 rounded-xl"
//                 />
//                 <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl">
//                     Update Password
//                 </button>
//                 {message && <p>{message}</p>}
//             </form>
//         </div>
//     )
// }

// export default ResetPassword



import { useState } from "react"
import { supabase } from "../../supabaseClient"
import { Eye, EyeOff } from "lucide-react"


function ResetPassword({ isDark = false }) {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [submitting, setSubmitting] = useState(false)

    

    const handleUpdate = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!password || !confirmPassword) {
            setError("Please fill all fields.")
            return
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setSubmitting(true)

        const { error } = await supabase.auth.updateUser({
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            setSuccess("Password updated successfully.")
            setPassword("")
            setConfirmPassword("")
        }

        setSubmitting(false)
    }
    

    const pageTitleClass = isDark ? "text-slate-100" : "text-slate-900"
    const pageSubClass = isDark ? "text-slate-400" : "text-slate-500"

    
    const cardClass = isDark
        ? "bg-slate-900 border border-slate-800"
        : "bg-white border border-slate-200"

    const inputClass = isDark
        ? "border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
        : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-indigo-200 focus:border-indigo-500"

    const errorClass = isDark
        ? "bg-red-900/30 border border-red-800 text-red-300"
        : "bg-red-50 border border-red-200 text-red-700"

    const successClass = isDark
        ? "bg-emerald-900/30 border border-emerald-800 text-emerald-300"
        : "bg-emerald-50 border border-emerald-200 text-emerald-700"

    return (
        <div className="space-y-8">

            {/* Page Header */}
            <div>
                <h1 className={`text-2xl font-semibold ${pageTitleClass}`}>
                    Security
                </h1>
                <p className={`text-sm mt-1 ${pageSubClass}`}>
                    Update your account password to keep your account secure.
                </p>
            </div>

            {/* Card */}
            <div className={`max-w-2xl rounded-3xl shadow-sm p-8 space-y-6 ${cardClass}`}>

                <h2 className={`text-lg font-medium ${pageTitleClass}`}>
                    Reset password
                </h2>

                <form onSubmit={handleUpdate} className="space-y-5">

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${pageTitleClass}`}>
                            New password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={submitting}
                                placeholder="Enter new password"
                                className={`w-full px-4 py-3 pr-12 rounded-2xl border transition focus:outline-none focus:ring-2 ${inputClass}`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"
                                    }`}
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className={`text-sm font-medium ${pageTitleClass}`}>
                            Confirm password
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={submitting}
                            placeholder="Re-enter password"
                            className={`w-full px-4 py-3 rounded-2xl border transition focus:outline-none focus:ring-2 ${inputClass}`}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={`text-sm px-4 py-3 rounded-2xl ${errorClass}`}>
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className={`text-sm px-4 py-3 rounded-2xl ${successClass}`}>
                            {success}
                        </div>
                    )}

                    {/* Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className={`px-6 py-3 rounded-2xl font-semibold text-white transition ${submitting
                                    ? "bg-slate-400 cursor-wait"
                                    : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
                                }`}
                        >
                            {submitting ? "Updating..." : "Update password"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}

export default ResetPassword
