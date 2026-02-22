import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import StudyImage from "../../assets/logo.png"
import { Eye, EyeOff } from "lucide-react"

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  //========= Handle password forget=================
  const handleForgotPassword = async () => {
    if (!email) {
      setError("Enter your email first.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    // //=============================
    // await supabase.auth.updateUser({
    //   password,
    // })

    // await supabase.auth.signOut()

    // navigate("/")

    // //===================

    if (error) {
      setError(error.message)
    } else {
      // alert("Password reset email sent. Check your inbox.")
      setError("Password reset email sent. Check inbox.")
    }
  }

  //===============================================

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (!email || !password) {
        setError('Please enter email and password')
        setSubmitting(false)
        return
      }

      if (mode === 'signin') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) throw signInError

        if (!data.user?.email_confirmed_at) {
          setError('Please verify your email before signing in.')
          setSubmitting(false)
          return
        }

        onAuthenticated(data.user)
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        setError('')
        setSubmitting(false)
        alert('Account created! Please check your email to verify before signing in.')
        setMode('signin')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">

      <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white">

        {/* LEFT – Hero / Brand */}
        <div className="hidden lg:flex lg:w-1/2 bg-white p-10 xl:p-16 items-center justify-center relative">

          {/* Subtle decorative elements */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl" />

          <div className="relative z-10 text-center lg:text-left space-y-10 max-w-lg">

            <img
              src={StudyImage}
              alt="Odyssey Study Planner"
              className="w-64 mx-auto lg:mx-0 drop-shadow-xl hover:scale-105 transition-transform duration-500"
            />

            <div>
              <h1 className=" text-6xl md:text-7xl font-normal tracking-[0.05em] uppercase text-slate-900">
                {/* Odyssey */}
                Deep Work
              </h1>
              <p className="mt-4 text-xl text-slate-600 font-light">
                Master focus. Track real progress. Conquer your semester.
              </p>
            </div>

            <div className="space-y-5 text-left text-slate-700 text-lg">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                Pomodoro + Stopwatch sessions
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Smart goal & progress forecasting
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                Beautiful analytics & streaks
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT – Auth Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex items-center border-l border-slate-200/40">

          <div className="w-full max-w-md mx-auto space-y-8">

            {/* Mobile logo + title */}
            <div className="lg:hidden text-center space-y-5 pb-6">
              <img
                src={StudyImage}
                alt="Odyssey"
                className="w-28 mx-auto drop-shadow-md"
              />
              <h1 className="text-5xl font-black text-slate-900">
                Odyssey
              </h1>
            </div>

            {/* Mode toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'signin'
                    ? 'bg-white shadow-md text-slate-900'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'signup'
                    ? 'bg-white shadow-md text-slate-900'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
                  }`}
              >
                Sign Up
              </button>
            </div>

            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                {mode === 'signin' ? 'Welcome back' : 'Get started now'}
              </h2>
              <p className="text-slate-600 text-base">
                Your study journey — synced, secure, beautiful.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 shadow-sm"
                  placeholder="you@odyssey.study"
                  disabled={submitting}
                  required
                />
              </div>

              {/* <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 shadow-sm"
                  placeholder="••••••••"
                  disabled={submitting}
                  required
                />
                {mode === 'signin' && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div> */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 pr-14 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 shadow-sm"
                    placeholder="••••••••"
                    disabled={submitting}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {mode === 'signin' && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-indigo-600 hover:text-indigo-800 transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              </div>


              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-4 rounded-2xl font-semibold text-lg tracking-wide transition-all duration-300 shadow-md ${submitting
                    ? 'bg-slate-300 text-slate-500 cursor-wait'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] hover:shadow-indigo-300/40'
                  }`}
              >
                {submitting
                  ? 'Processing...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>

            </form>

            <div className="text-center text-sm text-slate-600">
              {mode === 'signin'
                ? "New here?"
                : "Already have an account?"}{' '}
              <button
                type="button"
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-indigo-600 font-medium hover:text-indigo-800 transition"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}

export default AuthScreen


// import { useState } from 'react'
// import { supabase } from '../../supabaseClient'
// import StudyImage from "../../assets/logo.png"

// function AuthScreen({ onAuthenticated }) {
//   const [mode, setMode] = useState('signin')
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError] = useState('')
//   const [submitting, setSubmitting] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setError('')
//     setSubmitting(true)

//     try {
//       if (!email || !password) {
//         setError('Please enter email and password')
//         setSubmitting(false)
//         return
//       }

//       if (mode === 'signin') {
//         const { data, error: signInError } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         })

//         if (signInError) throw signInError

//         if (!data.user?.email_confirmed_at) {
//           setError('Please verify your email before signing in.')
//           setSubmitting(false)
//           return
//         }

//         onAuthenticated(data.user)
//       } else {
//         const { data, error: signUpError } = await supabase.auth.signUp({
//           email,
//           password,
//         })

//         if (signUpError) throw signUpError

//         setError('')
//         setSubmitting(false)
//         alert('Account created! Please check your email to verify before signing in.')
//         setMode('signin')
//       }
//     } catch (err) {
//       setError(err.message || 'Something went wrong. Please try again.')
//       setSubmitting(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">

//       <div className="w-full max-w-6xl flex flex-col lg:flex-row rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 bg-white">

//         {/* LEFT – Hero / Brand */}
//         <div className="hidden lg:flex lg:w-1/2 bg-white p-10 xl:p-16 items-center justify-center relative">

//           {/* Subtle decorative elements */}
//           <div className="absolute -top-20 -left-20 w-80 h-80 bg-sky-100/40 rounded-full blur-3xl" />
//           <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-100/30 rounded-full blur-3xl" />

//           <div className="relative z-10 text-center lg:text-left space-y-10 max-w-lg">

//             <img
//               src={StudyImage}
//               alt="Odyssey Study Planner"
//               className="w-64 mx-auto lg:mx-0 drop-shadow-xl hover:scale-105 transition-transform duration-500"
//             />

//             <div>
//               <h1 className=" text-6xl md:text-7xl font-normal tracking-[0.05em] uppercase text-slate-900">
//                 {/* Odyssey */}
//                 Deep Work
//               </h1>
//               <p className="mt-4 text-xl text-slate-600 font-light">
//                 Master focus. Track real progress. Conquer your semester.
//               </p>
//             </div>

//             <div className="space-y-5 text-left text-slate-700 text-lg">
//               <div className="flex items-center gap-4">
//                 <div className="w-3 h-3 rounded-full bg-sky-500" />
//                 Pomodoro + Stopwatch sessions
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="w-3 h-3 rounded-full bg-emerald-500" />
//                 Smart goal & progress forecasting
//               </div>
//               <div className="flex items-center gap-4">
//                 <div className="w-3 h-3 rounded-full bg-indigo-500" />
//                 Beautiful analytics & streaks
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* RIGHT – Auth Form */}
//         <div className="w-full lg:w-1/2 bg-white p-8 md:p-12 lg:p-16 flex items-center border-l border-slate-200/40">

//           <div className="w-full max-w-md mx-auto space-y-8">

//             {/* Mobile logo + title */}
//             <div className="lg:hidden text-center space-y-5 pb-6">
//               <img
//                 src={StudyImage}
//                 alt="Odyssey"
//                 className="w-28 mx-auto drop-shadow-md"
//               />
//               <h1 className="text-5xl font-black text-slate-900">
//                 Odyssey
//               </h1>
//             </div>

//             {/* Mode toggle */}
//             <div className="flex bg-slate-100 p-1.5 rounded-full border border-slate-200 shadow-sm">
//               <button
//                 type="button"
//                 onClick={() => setMode('signin')}
//                 className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'signin'
//                     ? 'bg-white shadow-md text-slate-900'
//                     : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
//                   }`}
//               >
//                 Sign In
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setMode('signup')}
//                 className={`flex-1 py-3 rounded-full text-sm font-semibold transition-all duration-300 ${mode === 'signup'
//                     ? 'bg-white shadow-md text-slate-900'
//                     : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
//                   }`}
//               >
//                 Sign Up
//               </button>
//             </div>

//             <div className="text-center space-y-3">
//               <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
//                 {mode === 'signin' ? 'Welcome back' : 'Get started now'}
//               </h2>
//               <p className="text-slate-600 text-base">
//                 Your study journey — synced, secure, beautiful.
//               </p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-6">

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700 block">
//                   Email address
//                 </label>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 shadow-sm"
//                   placeholder="you@odyssey.study"
//                   disabled={submitting}
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-slate-700 block">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-5 py-4 rounded-2xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 transition-all duration-300 shadow-sm"
//                   placeholder="••••••••"
//                   disabled={submitting}
//                   required
//                 />
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-2xl text-sm">
//                   {error}
//                 </div>
//               )}

//               <button
//                 type="submit"
//                 disabled={submitting}
//                 className={`w-full py-4 rounded-2xl font-semibold text-lg tracking-wide transition-all duration-300 shadow-md ${submitting
//                     ? 'bg-slate-300 text-slate-500 cursor-wait'
//                     : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] hover:shadow-indigo-300/40'
//                   }`}
//               >
//                 {submitting
//                   ? 'Processing...'
//                   : mode === 'signin'
//                     ? 'Sign In'
//                     : 'Create Account'}
//               </button>

//             </form>

//             <div className="text-center text-sm text-slate-600">
//               {mode === 'signin'
//                 ? "New here?"
//                 : "Already have an account?"}{' '}
//               <button
//                 type="button"
//                 onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
//                 className="text-indigo-600 font-medium hover:text-indigo-800 transition"
//               >
//                 {mode === 'signin' ? 'Sign up' : 'Sign in'}
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>

//     </div>
//   )
// }

// export default AuthScreen
