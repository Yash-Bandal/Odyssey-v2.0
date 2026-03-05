import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Swal from "sweetalert2";
import { playDropDown, playDelete } from "../utils/sound"
import GoalsHeader from '../components/goals/GoalsHeader'
import SemesterPlanningCard from '../components/goals/SemesterPlanningCard'
import SubjectsCard from '../components/goals/SubjectsCard'
import GoalsNotesCard from '../components/goals/GoalsNotesCard'

import { useSemesterCalculations } from '../hooks/useSemesterCalculations'

function GoalsPage({ user, semester, onSemesterChanged, isDark = false }) {
  const [subjects, setSubjects] = useState([])
  const [saving, setSaving] = useState(false)
  const [, setError] = useState('')
  const [, setSuccess] = useState('')

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
      onClick: playDropDown()
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
    // 🔊 PLAY SOUND HERE (after confirm button click)
    playDelete();
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


  // ================= STYLES =================
  // Card containers (for semester, subjects, and tips sections)
  const cardClass = isDark
    ? 'rounded-3xl bg-slate-900 border border-slate-800 shadow-sm p-8 space-y-8'
    : 'rounded-3xl bg-white border border-slate-200 shadow-sm p-8 space-y-8';

  // Inputs (for dates, hours, subject names, etc.)
  const inputClass = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition'
    : 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition';

  // Labels (for "Semester Start", "Total Goal Hours", etc.)
  const labelClass = isDark ? 'text-sm font-medium text-slate-300' : 'text-sm font-medium text-slate-600';

  // Metric cards (the small cards with icons like CalendarDays, Clock)
  const metricCardClass = isDark
    ? 'flex items-center gap-4 bg-slate-800 border border-slate-700 rounded-2xl p-5'
    : 'flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5';

  const metricMutedClass = isDark ? 'text-xs uppercase tracking-wide text-slate-400' : 'text-xs uppercase tracking-wide text-slate-500';

  const metricTitleClass = isDark ? 'text-2xl font-bold text-slate-100' : 'text-2xl font-bold text-slate-900';

  // Save button
  const saveButtonClass = isDark
    ? `px-6 py-3 rounded-xl font-semibold transition shadow-sm ${saving ? 'bg-slate-600 text-slate-300 cursor-wait' : 'bg-sky-500 text-white hover:bg-sky-600'}`
    : `px-6 py-3 rounded-xl font-semibold transition shadow-sm ${saving ? 'bg-slate-200 text-slate-500 cursor-wait' : 'bg-sky-500 text-white hover:bg-sky-600'}`;

  // Header texts (for "Semester Planning" and "Subjects")
  const headerTitleClass = isDark ? 'text-3xl font-bold text-slate-100' : 'text-3xl font-bold text-slate-900';

  const headerMutedClass = isDark ? 'text-slate-400 mt-2' : 'text-slate-500 mt-2';

  const subjectHeaderTitleClass = isDark ? 'text-xl font-semibold text-slate-100' : 'text-xl font-semibold text-slate-900';

  const subjectHeaderMutedClass = isDark ? 'text-sm text-slate-400 mt-1' : 'text-sm text-slate-500 mt-1';

  // Add subject button
  const addButtonClass = isDark
    ? 'inline-flex items-center gap-2 text-sm font-medium text-sky-400 hover:text-sky-300 transition'
    : 'inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-700 transition';

  // Subject rows (the containers for each subject)
  const subjectRowClass = isDark
    ? 'flex flex-col md:flex-row gap-4 md:items-center border border-slate-700 rounded-2xl p-4 bg-slate-800'
    : 'flex flex-col md:flex-row gap-4 md:items-center border border-slate-200 rounded-2xl p-4 bg-slate-50';

  // Subject text inputs (e.g., subject name)
  const subjectInputClass = isDark
    ? 'flex-1 bg-transparent border-none outline-none text-sm text-slate-100'
    : 'flex-1 bg-transparent border-none outline-none text-sm text-slate-800';

  // Subject number inputs (e.g., "Plan Hours", "Weight %")
  const subjectNumberInputClass = isDark
    ? 'w-full md:w-32 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500'
    : 'w-full md:w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500';

  // Delete button (trash icon)
  const deleteButtonClass = isDark ? 'text-red-400 hover:text-red-300 transition' : 'text-red-500 hover:text-red-600 transition';

  // Icons (e.g., BookOpen, CalendarDays) - optional subtle color adjustment
  const iconColorClass = isDark ? 'text-slate-300' : 'text-slate-400';

  // Tips card
  const tipsCardClass = isDark
    ? 'rounded-3xl bg-sky-900/20 border border-sky-800/50 p-6'
    : 'rounded-3xl bg-sky-50 border border-sky-200 p-6';

  const tipsTitleClass = isDark ? 'text-lg font-semibold text-slate-100 mb-3' : 'text-lg font-semibold text-slate-800 mb-3';

  const tipsTextClass = isDark ? 'space-y-2 text-sm text-slate-300' : 'space-y-2 text-sm text-slate-600';


  // ================= UI =================
  return (
    <div className="space-y-10 max-w-6xl">
      <GoalsHeader
        headerTitleClass={headerTitleClass}
        headerMutedClass={headerMutedClass}
      />

      <SemesterPlanningCard
        cardClass={cardClass}
        labelClass={labelClass}
        inputClass={inputClass}
        form={form}
        handleChange={handleChange}
        calculations={calculations}
        metricCardClass={metricCardClass}
        metricMutedClass={metricMutedClass}
        metricTitleClass={metricTitleClass}
        handleSave={handleSave}
        saving={saving}
        saveButtonClass={saveButtonClass}
      />

      <SubjectsCard
        cardClass={cardClass}
        subjectHeaderTitleClass={subjectHeaderTitleClass}
        subjectHeaderMutedClass={subjectHeaderMutedClass}
        handleAddSubject={handleAddSubject}
        addButtonClass={addButtonClass}
        subjects={subjects}
        setSubjects={setSubjects}
        subjectRowClass={subjectRowClass}
        iconColorClass={iconColorClass}
        subjectInputClass={subjectInputClass}
        subjectNumberInputClass={subjectNumberInputClass}
        handleDeleteSubject={handleDeleteSubject}
        deleteButtonClass={deleteButtonClass}
      />

      <GoalsNotesCard
        tipsCardClass={tipsCardClass}
        tipsTitleClass={tipsTitleClass}
        tipsTextClass={tipsTextClass}
      />
    </div>
  )
}

export default GoalsPage
