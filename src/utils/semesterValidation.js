import { toDateOnly } from './dateUtils'

export const validateSemesterUpdate = async ({ form, semester }) => {
    const today = toDateOnly(new Date())

    const newStart = toDateOnly(form.startDate)
    const newEnd = toDateOnly(form.endDate)

    const oldStartDate = toDateOnly(semester.start_date)
    const oldEndDate = toDateOnly(semester.end_date)

    const isStartChanged = newStart.getTime() !== oldStartDate.getTime()
    const isEndChanged = newEnd.getTime() !== oldEndDate.getTime()

    // 🔒 START DATE VALIDATION (only if changed)
    if (isStartChanged) {
        if (newStart < oldStartDate) {
            return {
                title: "Invalid Start Date",
                text: "Start date cannot be earlier than original start date.",
            }
        }

        if (newStart < today) {
            return {
                title: "Invalid Start Date",
                text: "Start date cannot be moved into the past.",
            }
        }
    }

    // 🔒 END DATE VALIDATION (only if changed)
    if (isEndChanged) {
        if (newEnd < today) {
            return {
                title: "Invalid End Date",
                text: "End date cannot be in the past.",
            }
        }

        if (newEnd < newStart) {
            return {
                title: "Invalid Range",
                text: "End date cannot be before start date.",
            }
        }
    }

    return null
}

    //======Old setup=============
    // const oldStart = new Date(semester.start_date)
    // const oldEnd = new Date(semester.end_date)

    // const newEnd = new Date(form.endDate)

    // // ❌ start date backward

    // // const today = new Date() //considers 00:00 as end
    // const today = toDateOnly(new Date())

    // const todayOnly = new Date(today.toDateString())
    // const newStart = new Date(form.startDate)

    // // ❌ ONLY block past dates
    // if (newStart < todayOnly) {
    //   await Swal.fire({
    //     icon: "error",
    //     title: "Invalid Start Date",
    //     text: "Start date cannot be in the past.",
    //   })
    //   return
    // }
    // // ❌ end date in past
    // if (newEnd < new Date(today.toDateString())) {
    //   await Swal.fire({
    //     icon: "error",
    //     title: "Invalid End Date",
    //     text: "End date cannot be in the past.",
    //   })
    //   return
    // }


    //=================================





    
    
        // const today = toDateOnly(new Date())
    
        // const newStart = toDateOnly(form.startDate)
        // const newEnd = toDateOnly(form.endDate)
    
        // const oldStartDate = toDateOnly(semester.start_date)
        // const oldEndDate = toDateOnly(semester.end_date)
        // const isStartChanged = newStart.getTime() !== oldStartDate.getTime()
        // const isEndChanged = newEnd.getTime() !== oldEndDate.getTime()
    
    
        // // 🔒 START DATE VALIDATION (only if changed)
        // if (isStartChanged) {
        //   // ❌ prevent going backward before original start
        //   if (newStart < oldStartDate) {
        //     await Swal.fire({
        //       icon: "error",
        //       title: "Invalid Start Date",
        //       text: "Start date cannot be earlier than original start date.",
        //     })
        //     return
        //   }
    
        //   // ❌ prevent moving start into past (optional strict rule)
        //   if (newStart < today) {
        //     await Swal.fire({
        //       icon: "error",
        //       title: "Invalid Start Date",
        //       text: "Start date cannot be moved into the past.",
        //     })
        //     return
        //   }
        // }
    
        // // 🔒 END DATE VALIDATION (only if changed)
        // if (isEndChanged) {
        //   if (newEnd < today) {
        //     await Swal.fire({
        //       icon: "error",
        //       title: "Invalid End Date",
        //       text: "End date cannot be in the past.",
        //     })
        //     return
        //   }
    
        //   // ❌ prevent end before start
        //   if (newEnd < newStart) {
        //     await Swal.fire({
        //       icon: "error",
        //       title: "Invalid Range",
        //       text: "End date cannot be before start date.",
        //     })
        //     return
        //   }
        // }