// import { useState } from 'react'
// import { supabase } from '../supabaseClient'
// import { useSemesterCalculations } from '../hooks/useSemesterCalculations'


// function GoalsPage({ user, semester, onSemesterChanged, isDark = false }) {
//   //================Latest update============== 


// //=================================================



//   const [form, setForm] = useState({
//     startDate: semester?.start_date || '',
//     endDate: semester?.end_date || '',
//     totalHours: semester?.total_goal_hours ? String(semester.total_goal_hours) : '',
//   })
//   const [saving, setSaving] = useState(false)
//   const [error, setError] = useState('')
//   const [success, setSuccess] = useState('')
//   const goalsCardClass = isDark
//     ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
//     : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'
//   const goalsTitleClass = isDark ? 'text-slate-100' : 'text-slate-900'
//   const goalsMutedClass = isDark ? 'text-slate-400' : 'text-slate-500'
//   const goalsInputClass = isDark
//     ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500'
//     : 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500'
//   const goalsMiniCardClass = isDark
//     ? 'rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3'
//     : 'rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'

//   const calculations = useSemesterCalculations({
//     startDate: form.startDate,
//     endDate: form.endDate,
//     totalHours: form.totalHours,
//   })

//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }))
//     setError('')
//     setSuccess('')
//   }

//   const handleSave = async (event) => {
//     event.preventDefault()
//     setError('')
//     setSuccess('')

//     if (!calculations) {
//       setError('Provide a valid date range and total goal hours.')
//       return
//     }

//     setSaving(true)
//     const { error: updateError } = await supabase
//       .from('semesters')
//       .update({
//         start_date: form.startDate,
//         end_date: form.endDate,
//         total_goal_hours: Number(form.totalHours),
//         total_study_days: calculations.totalDays,
//         daily_required_hours: calculations.dailyAverage,
//         weekly_required_hours: calculations.weeklyPace,
//       })
//       .eq('id', semester.id)
//       .eq('user_id', user.id)
//       .select('id')
//       .single()

//     setSaving(false)

//     if (updateError) {
//       setError(updateError.message || 'Unable to update semester goals.')
//       return
//     }

//     if (onSemesterChanged) {
//       await onSemesterChanged()
//     }
//     setSuccess('Goals updated successfully.')
//   }

//   return (
//     <div className="space-y-6">
//       <section className={goalsCardClass}>
//         <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Goals</div>
//         <h1 className={['mt-2 text-2xl font-semibold', goalsTitleClass].join(' ')}>Active Semester Goals</h1>
//         <p className={['mt-2 text-sm', goalsMutedClass].join(' ')}>
//           Update your current semester range and total target. Required pace values recalculate automatically.
//         </p>
//       </section>

//       <section className={goalsCardClass}>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className={goalsMiniCardClass}>
//             <div className={['text-xs', goalsMutedClass].join(' ')}>Current start date</div>
//             <div className={['mt-1 text-sm font-semibold', goalsTitleClass].join(' ')}>{semester.start_date || '-'}</div>
//           </div>
//           <div className={goalsMiniCardClass}>
//             <div className={['text-xs', goalsMutedClass].join(' ')}>Current end date</div>
//             <div className={['mt-1 text-sm font-semibold', goalsTitleClass].join(' ')}>{semester.end_date || '-'}</div>
//             {/* <div className={['mt-1 text-sm font-semibold', goalsTitleClass].join(' ')}>{semester.end_date || 'â€”'}</div> */}
//           </div>
//           <div className={goalsMiniCardClass}>
//             <div className={['text-xs', goalsMutedClass].join(' ')}>Current total goal</div>
//             <div className={['mt-1 text-sm font-semibold', goalsTitleClass].join(' ')}>
//               {semester.total_goal_hours ? `${Number(semester.total_goal_hours)} h` : '-'}
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className={goalsCardClass}>
//         <form onSubmit={handleSave} className="space-y-6">
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className="space-y-1.5">
//               <label className={['text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>Start date</label>
//               <input
//                 type="date"
//                 value={form.startDate}
//                 onChange={(event) => handleChange('startDate', event.target.value)}
//                 className={goalsInputClass}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className={['text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>End date</label>
//               <input
//                 type="date"
//                 value={form.endDate}
//                 onChange={(event) => handleChange('endDate', event.target.value)}
//                 className={goalsInputClass}
//               />
//             </div>
//             <div className="space-y-1.5">
//               <label className={['text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-600'].join(' ')}>Total goal hours</label>
//               <input
//                 type="number"
//                 min="1"
//                 step="0.5"
//                 value={form.totalHours}
//                 onChange={(event) => handleChange('totalHours', event.target.value)}
//                 className={goalsInputClass}
//                 placeholder="e.g. 320"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             <div className={goalsMiniCardClass}>
//               <div className={['text-xs', goalsMutedClass].join(' ')}>Total study days</div>
//               <div className={['mt-1 text-lg font-semibold', goalsTitleClass].join(' ')}>{calculations ? calculations.totalDays : '—'}</div>
//             </div>
//             <div className={goalsMiniCardClass}>
//               <div className={['text-xs', goalsMutedClass].join(' ')}>Daily required</div>
//               <div className={['mt-1 text-lg font-semibold', goalsTitleClass].join(' ')}>
//                 {calculations ? `${calculations.dailyAverage.toFixed(2)} h` : '-'}
//               </div>
//             </div>
//             <div className={goalsMiniCardClass}>
//               <div className={['text-xs', goalsMutedClass].join(' ')}>Weekly required</div>
//               <div className={['mt-1 text-lg font-semibold', goalsTitleClass].join(' ')}>
//                 {calculations ? `${calculations.weeklyPace.toFixed(1)} h/week` : '-'}
//               </div>
//             </div>
//           </div>

//           {error && (
//             <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//               {error}
//             </div>
//           )}
//           {success && (
//             <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
//               {success}
//             </div>
//           )}

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={saving}
//               className={[
//                 'inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold transition',
//                 saving ? 'bg-slate-300 text-slate-500 cursor-wait' : 'bg-sky-500 text-white hover:bg-sky-600',
//               ].join(' ')}
//             >
//               {saving ? 'Saving...' : 'Update goals'}
//             </button>
//           </div>
//         </form>
//       </section>





//     </div>
//   )
// }


// export default GoalsPage


import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Swal from "sweetalert2";

import { useSemesterCalculations } from '../hooks/useSemesterCalculations'
import {
  CalendarDays,
  Clock,
  BarChart3,
  BookOpen,
  Trash2,
  Plus,
} from "lucide-react";

function GoalsPage({ user, semester, onSemesterChanged, isDark = false }) {
  const [subjects, setSubjects] = useState([])
  const [saving, setSaving] = useState(false)
  // const [error, setError] = useState('')
  // const [success, setSuccess] = useState('')

  const [form, setForm] = useState({
    startDate: semester?.start_date || '',
    endDate: semester?.end_date || '',
    totalHours: semester?.total_goal_hours
      ? String(semester.total_goal_hours)
      : '',
  })

  // ================= LOAD SUBJECTS =================
  useEffect(() => {
    if (!semester?.id) return

    const loadSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('semester_id', semester.id)
        .order('name')

      if (!error) setSubjects(data || [])
    }

    loadSubjects()
  }, [semester?.id])

  // ================= CALCULATIONS =================
  const calculations = useSemesterCalculations({
    startDate: form.startDate,
    endDate: form.endDate,
    totalHours: form.totalHours,
  })

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  // ================= SAVE EVERYTHING =================
  // const handleSave = async (event) => {
  //   event.preventDefault()
  //   setError('')
  //   setSuccess('')

  //   if (!calculations) {
  //     setError('Provide valid semester dates and total hours.')
  //     return
  //   }

  //   setSaving(true)

  //   try {
  //     // 1️⃣ Update semester
  //     const { error: semesterError } = await supabase
  //       .from('semesters')
  //       .update({
  //         start_date: form.startDate,
  //         end_date: form.endDate,
  //         total_goal_hours: Number(form.totalHours),
  //         total_study_days: calculations.totalDays,
  //         daily_required_hours: calculations.dailyAverage,
  //         weekly_required_hours: calculations.weeklyPace,
  //       })
  //       .eq('id', semester.id)
  //       .eq('user_id', user.id)

  //     if (semesterError) throw semesterError

  //     // 2️⃣ Save subjects
  //     for (const subject of subjects) {
  //       if (subject.id) {
  //         await supabase
  //           .from('subjects')
  //           .update({
  //             name: subject.name,
  //             target_hours: Number(subject.target_hours),
  //             weight: subject.weight ? Number(subject.weight) : null,
  //           })
  //           .eq('id', subject.id)
  //       } else {
  //         await supabase.from('subjects').insert({
  //           semester_id: semester.id,
  //           name: subject.name,
  //           target_hours: Number(subject.target_hours),
  //           weight: subject.weight ? Number(subject.weight) : null,
  //         })
  //       }
  //     }

  //     // 3️⃣ Reload subjects so new inserts get real IDs
  //     const { data: refreshed } = await supabase
  //       .from('subjects')
  //       .select('*')
  //       .eq('semester_id', semester.id)

  //     setSubjects(refreshed || [])

  //     if (onSemesterChanged) await onSemesterChanged()

  //     setSuccess('Goals and subjects updated successfully.')
  //   } catch (err) {
  //     setError(err.message || 'Failed to save changes.')
  //   }

  //   setSaving(false)
  // }
  const handleSave = async (event) => {
    event.preventDefault();

    if (!calculations) {
      await Swal.fire({
        icon: "error",
        title: "Invalid Input",
        text: "Please provide valid semester dates and total goal hours.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Save changes?",
      text: "This will update semester settings and subjects.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
      confirmButtonColor: "#0ea5e9",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSaving(true);

    try {
      // Update semester
      const { error: semesterError } = await supabase
        .from("semesters")
        .update({
          start_date: form.startDate,
          end_date: form.endDate,
          total_goal_hours: Number(form.totalHours),
          total_study_days: calculations.totalDays,
          daily_required_hours: calculations.dailyAverage,
          weekly_required_hours: calculations.weeklyPace,
        })
        .eq("id", semester.id)
        .eq("user_id", user.id);

      if (semesterError) throw semesterError;

      // Save subjects
      for (const subject of subjects) {
        if (subject.id) {
          await supabase
            .from("subjects")
            .update({
              name: subject.name,
              target_hours: Number(subject.target_hours),
              weight: subject.weight ? Number(subject.weight) : null,
            })
            .eq("id", subject.id);
        } else {
          await supabase.from("subjects").insert({
            semester_id: semester.id,
            name: subject.name,
            target_hours: Number(subject.target_hours),
            weight: subject.weight ? Number(subject.weight) : null,
          });
        }
      }

      // Refresh subjects
      const { data: refreshed } = await supabase
        .from("subjects")
        .select("*")
        .eq("semester_id", semester.id);

      setSubjects(refreshed || []);

      if (onSemesterChanged) await onSemesterChanged();

      await Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Changes saved successfully",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
      });

    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.message || "Something went wrong.",
      });
    }

    setSaving(false);
  };

  // ================= ADD SUBJECT =================
  const handleAddSubject = () => {
    setSubjects((prev) => [
      ...prev,
      {
        id: null,
        semester_id: semester.id,
        name: '',
        target_hours: '',
        weight: '',
      },
    ])
  }

  // ================= DELETE SUBJECT =================
  // const handleDeleteSubject = async (id) => {
  //   if (!id) {
  //     setSubjects((prev) => prev.filter((s) => s.id !== id))
  //     return
  //   }

  //   await supabase.from('subjects').delete().eq('id', id)
  //   setSubjects((prev) => prev.filter((s) => s.id !== id))
  // }
  const handleDeleteSubject = async (id) => {
    if (!id) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
      return;
    }

    const result = await Swal.fire({
      title: "Delete subject?",
      text: "All related sessions must be removed first.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    const { error } = await supabase
      .from("subjects")
      .delete()
      .eq("id", id);

    if (error) {
      await Swal.fire({
        icon: "error",
        title: "Cannot delete",
        text: "Delete related sessions first.",
      });
      return;
    }

    setSubjects((prev) => prev.filter((s) => s.id !== id));

    await Swal.fire({
      icon: "success",
      title: "Deleted",
      text: "Subject removed successfully.",
    });
  };


  // ================= STYLES =================
  const card = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-6'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-6'

  const input = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500'
    : 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500'

  // ================= UI =================
  return (
    <div className="space-y-10 max-w-6xl">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Semester Planning
        </h1>
        <p className="text-slate-500 mt-2">
          Define your semester timeline and distribute study hours strategically.
        </p>
      </div>


      {/* ================= SEMESTER CARD ================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-8">

        {/* Date + Goal Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Semester Start
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Semester End
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-600">
              Total Goal Hours
            </label>
            <input
              type="number"
              value={form.totalHours}
              onChange={(e) => handleChange('totalHours', e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none transition"
              placeholder="e.g. 300"
            />
          </div>
        </div>

        {/* Metrics */}
        {calculations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <CalendarDays className="h-8 w-8 text-sky-500" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total Study Days
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {calculations.totalDays}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <Clock className="h-8 w-8 text-emerald-500" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Daily Required
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {calculations.dailyAverage.toFixed(2)} h
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <BarChart3 className="h-8 w-8 text-indigo-500" />
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Weekly Required
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {calculations.weeklyPace.toFixed(1)} h
                </div>
              </div>
            </div>

          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition shadow-sm"
          >

            {saving ? "Saving..." : "Save All Changes"}
          </button>
        </div>
      </section>


      {/* ================= SUBJECTS ================= */}
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Subjects
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Allocate hours and weightage for each subject.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddSubject}
            className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Subject
          </button>
        </div>


        {/* Subject Rows */}
        <div className="space-y-4">
          {subjects.map((subject, index) => (
            <div
              key={subject.id || `new-${index}`}
              className="flex flex-col md:flex-row gap-4 md:items-center border border-slate-200 rounded-2xl p-4 bg-slate-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <BookOpen className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  value={subject.name}
                  onChange={(e) => {
                    const updated = [...subjects]
                    updated[index].name = e.target.value
                    setSubjects(updated)
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sm"
                  placeholder="Subject name"
                />
              </div>

              <input
                type="number"
                value={subject.target_hours}
                onChange={(e) => {
                  const updated = [...subjects]
                  updated[index].target_hours = e.target.value
                  setSubjects(updated)
                }}
                className="w-full md:w-32 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Plan Hours"
              />

              <input
                type="number"
                value={subject.weight || ''}
                onChange={(e) => {
                  const updated = [...subjects]
                  updated[index].weight = e.target.value
                  setSubjects(updated)
                }}
                className="w-full md:w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm"
                placeholder="Weight %"
              />

              <button
                type="button"
                onClick={() => handleDeleteSubject(subject.id)}
                className="text-red-500 hover:text-red-600 transition"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

      </section>


      {/* ================= NOTES ================= */}
      {/* ================= TIPS ================= */}
      <section className="rounded-3xl bg-sky-50 border border-sky-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Important Notes
        </h2>

        <ul className="space-y-2 text-sm text-slate-600">
          <li>
            • A subject cannot be deleted if study sessions are linked to it.
            Please delete all sessions related to that subject first.
          </li>

          <li>
            • All changes on this page — including semester settings and subjects —
            are saved together using the <strong>“Save All Changes”</strong> button.
          </li>
        </ul>
      </section>

    </div>

  )
}

export default GoalsPage
